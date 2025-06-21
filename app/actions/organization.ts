// app/actions/organization.ts

"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-server"
import type { Organization } from "@/lib/database"

export async function getUserOrganizationsServer(userId: string): Promise<Organization[]> {
  console.log("[OrgAction] fetching organisations for user:", userId)
  
  try {
    const supabaseAdmin = createSupabaseAdminClient()

    // The query is now more explicit and safer
    const { data, error } = await supabaseAdmin
      .from("organization_members")
      .select("organization:organizations(*)") // Explicitly alias the relationship
      .eq("user_id", userId)

    if (error) {
      console.error("[OrgAction] Supabase query error:", JSON.stringify(error, null, 2))
      return []
    }
    
    // The mapping logic is now simpler and safer
    return data?.map(m => m.organization).filter(Boolean) as Organization[] || []

  } catch (e) {
    console.error("[OrgAction] Unexpected exception:", e)
    return []
  }
}