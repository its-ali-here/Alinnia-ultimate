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