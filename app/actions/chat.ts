"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-server"

// This server action calls the PostgreSQL function we just created.
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

  return data;
}

// ADD THIS NEW FUNCTION
// This server action creates a new group channel and adds members to it.
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