"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

// This function is updated to include an 'is_owner' flag
export async function getChannelsForUserAction(userId: string) {
  if (!userId) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc('get_user_channels_with_details', {
    p_user_id: userId
  });

  if (error) {
    console.error("Error fetching user channels:", error);
    return [];
  }

  // Add the is_owner flag to each channel object
  return data.map(channel => ({
    ...channel,
    is_owner: channel.created_by === userId
  }));
}

// --- ADD THE FOLLOWING NEW FUNCTIONS ---

/**
 * Allows a user to leave a group channel.
 */
export async function leaveGroupChannelAction(channelId: string, userId: string) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
        .from('channel_members')
        .delete()
        .match({ channel_id: channelId, user_id: userId });

    if (error) {
        console.error("Error leaving group:", error);
        throw new Error("Could not leave the group.");
    }
    revalidatePath('/dashboard/chat');
}

/**
 * Allows the creator of a group channel to delete it entirely.
 */
export async function deleteGroupChannelAction(channelId: string, userId: string) {
    const supabase = createSupabaseAdminClient();

    // First, verify the user is the owner before proceeding
    const { data: channel, error: ownerCheckError } = await supabase
        .from('channels')
        .select('created_by')
        .eq('id', channelId)
        .single();

    if (ownerCheckError || !channel || channel.created_by !== userId) {
        throw new Error("You do not have permission to delete this group.");
    }

    // If ownership is confirmed, delete the channel.
    // The database is set up with 'CASCADE DELETE', so deleting the channel
    // will automatically delete all its messages and memberships.
    const { error: deleteError } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId);

    if (deleteError) {
        console.error("Error deleting group:", deleteError);
        throw new Error("Could not delete the group.");
    }
    revalidatePath('/dashboard/chat');
}

export async function createGroupChannelAction({
  organizationId,
  creatorId,
  name,
  memberIds,
}: {
  organizationId: string,
  creatorId: string,
  name: string,
  memberIds: string[],
}) {
  if (!organizationId || !creatorId || !name || !memberIds.length) {
    throw new Error("Missing required data to create a group channel.");
  }

  const supabase = createSupabaseAdminClient();

  // 1. Create the new channel
  const { data: channel, error: channelError } = await supabase
    .from('channels')
    .insert({
      organization_id: organizationId,
      created_by: creatorId,
      name: name,
      type: 'group',
    })
    .select()
    .single();

  if (channelError) {
    console.error("Error creating channel:", channelError);
    throw new Error("Could not create the new team channel.");
  }

  // 2. Add all selected members (including the creator) to the channel
  const membersToInsert = memberIds.map(id => ({
    channel_id: channel.id,
    user_id: id,
  }));

  const { error: membersError } = await supabase
    .from('channel_members')
    .insert(membersToInsert);

  if (membersError) {
    console.error("Error adding members to channel:", membersError);
    // In a real app, you might want to delete the channel that was just created,
    // but for now, we'll just throw the error.
    throw new Error("Could not add members to the new team.");
  }

  return channel;
}

export async function getOrCreateDmChannelAction({
  organizationId,
  currentUserId,
  otherUserId,
}: {
  organizationId: string,
  currentUserId: string,
  otherUserId: string,
}) {
  if (!organizationId || !currentUserId || !otherUserId) {
    throw new Error("Missing required data to get or create a DM channel.");
  }
  if (currentUserId === otherUserId) {
    throw new Error("Cannot create a DM channel with yourself.");
  }

  const supabase = createSupabaseAdminClient();

  // We need a predictable way to find a DM channel.
  // This requires a custom database function to check membership.
  // Let's create it first if it doesn't exist.
  const { data: existingChannel, error: existingError } = await supabase.rpc('get_existing_dm_channel', {
    user_id_1: currentUserId,
    user_id_2: otherUserId
  });

  if (existingError) {
    console.error("Error checking for existing DM channel:", existingError);
    throw new Error("Could not check for existing DM channel.");
  }

  // If a channel is found, return it immediately.
  if (existingChannel) {
    return existingChannel;
  }

  // If no channel exists, create a new one.
  const { data: newChannel, error: channelError } = await supabase
    .from('channels')
    .insert({
      organization_id: organizationId,
      created_by: currentUserId,
      type: 'dm',
    })
    .select()
    .single();

  if (channelError) {
    console.error("Error creating DM channel:", channelError);
    throw new Error("Could not create a new DM channel.");
  }

  // Add both users as members of the new channel.
  const { error: membersError } = await supabase
    .from('channel_members')
    .insert([
      { channel_id: newChannel.id, user_id: currentUserId },
      { channel_id: newChannel.id, user_id: otherUserId },
    ]);

  if (membersError) {
    console.error("Error adding members to DM channel:", membersError);
    throw new Error("Could not add members to the new DM channel.");
  }

  return newChannel;
}