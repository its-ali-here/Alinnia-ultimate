// New, more robust code for lib/supabase-server.ts
import { createClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase client that uses the service_role key for elevated access.
 * This should ONLY be used in server-side code (Server Actions, API Routes).
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase admin credentials are not configured. Check server environment variables.")
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}