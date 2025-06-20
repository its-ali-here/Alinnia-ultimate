"use server"

import {
  supabaseServer,
  supabaseAdmin,
  isSupabaseServerConfigured,
  isSupabaseAdminConfigured,
} from "@/lib/supabase-server"

interface Organization {
  id: string
  name?: string
  code?: string
}

import type { Database } from "@/lib/database" // your generated types
type OrganizationFromDb = Database["public"]["Tables"]["organizations"]["Row"]

/**
 * Returns the first organisation a user belongs to (or an empty array).
 * Falls back to supabaseAdmin (service-role) when RLS blocks the anon request.
 */
export async function getUserOrganizationsServer(userId: string): Promise<Organization[]> {
  console.log("[OrgAction] fetching organisations for user:", userId)

  const client =
    (isSupabaseAdminConfigured() && supabaseAdmin) || (isSupabaseServerConfigured() && supabaseServer) || null

  if (!client) {
    console.error("[OrgAction] Neither supabaseServer nor supabaseAdmin is configured – check env vars.")
    return []
  }

  try {
    const { data, error } = await client
      .from("organization_members")
      .select("organizations(*)")
      .eq("user_id", userId)
      .limit(1)

    if (error) {
      console.error("[OrgAction] Supabase query error:", JSON.stringify(error, null, 2))
      // If we queried with the anon client and hit RLS, retry once with admin:
      if (client === supabaseServer && isSupabaseAdminConfigured() && supabaseAdmin) {
        console.warn("[OrgAction] Retrying with supabaseAdmin (service-role key)…")
        const adminRes = await supabaseAdmin
          .from("organization_members")
          .select("organizations(*)")
          .eq("user_id", userId)
          .limit(1)
        if (adminRes.error) {
          console.error("[OrgAction] Admin retry also failed:", adminRes.error)
          return []
        }
        return adminRes.data.filter((m) => m.organizations).map((m) => m.organizations as Organization)
      }
      return []
    }

    return data.filter((m) => m.organizations).map((m) => m.organizations as Organization)
  } catch (e) {
    console.error("[OrgAction] Unexpected exception:", e)
    return []
  }
}
