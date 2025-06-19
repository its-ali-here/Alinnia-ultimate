"use server"

import { supabaseServer } from "@/lib/supabase-server"

export async function getUserOrganizationsServer(userId: string) {
  if (!supabaseServer) {
    console.error("getUserOrganizationsServer: Supabase server client is not configured.")
    return []
  }

  try {
    const { data, error } = await supabaseServer
      .from("organization_members")
      .select("organization_id, organizations(id, name, code)") // Select organization details
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching user organizations from server:", error)
      return []
    }

    // Map to a simpler structure if needed, or return raw data
    return data
      .map((member) => ({
        id: member.organizations?.id,
        name: member.organizations?.name,
        code: member.organizations?.code,
      }))
      .filter((org) => org.id !== null) as { id: string; name: string; code: string }[]
  } catch (err) {
    console.error("Unexpected error in getUserOrganizationsServer:", err)
    return []
  }
}
