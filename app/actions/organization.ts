"use server"

import { supabaseServer } from "@/lib/supabase-server"
import type { UserOrganization } from "@/lib/database" // Assuming this type is defined in database.ts

export async function getUserOrganizationsServerAction(userId: string): Promise<UserOrganization[]> {
  if (!supabaseServer) {
    console.warn("Supabase server client not configured, cannot fetch user organizations.")
    return []
  }

  const { data, error } = await supabaseServer
    .from("organization_members")
    .select(
      `
      organization_id,
      role,
      organizations (
        id,
        name,
        owner_id
      )
    `,
    )
    .eq("user_id", userId)
    .returns<UserOrganization[]>()

  if (error) {
    console.error("Error fetching user organizations in Server Action:", error)
    // Do not throw error directly, return empty array or handle gracefully
    return []
  }

  return data || []
}
