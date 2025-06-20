"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-server"
import type { Organization } from "@/lib/database"

export async function getUserOrganizationsServer(userId: string): Promise<Organization[]> {
  console.log("[OrgAction] fetching organisations for user:", userId)
  
  try {
    const supabaseAdmin = createSupabaseAdminClient() // Create a fresh client on every call

    const { data, error } = await supabaseAdmin
      .from("organization_members")
      .select("organizations(*)")
      .eq("user_id", userId)
      .limit(1)

    if (error) {
      console.error("[OrgAction] Supabase query error:", JSON.stringify(error, null, 2))
      return []
    }
    
    // Ensure we only return valid organization objects
    return data?.filter(m => m.organizations).map(m => m.organizations as Organization) || []

  } catch (e) {
    console.error("[OrgAction] Unexpected exception:", e)
    return []
  }
}