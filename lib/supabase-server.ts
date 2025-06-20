import { createClient } from "@supabase/supabase-js"

// Helper to check if the Admin client is configured
export const isSupabaseAdminConfigured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

// A function to get the Supabase admin client. It's cached so we don't create a new one on every request.
const getSupabaseAdmin = () => {
  if (isSupabaseAdminConfigured()) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  // If the keys are not set, we'll log a warning and return undefined.
  console.warn("Supabase admin client not configured. SUPABASE_SERVICE_ROLE_KEY is missing.");
  return undefined;
}

// Create and export the admin client. It will be 'undefined' if keys are missing.
export const supabaseAdmin = getSupabaseAdmin()

// --- The following can be kept for future use or if other parts of the app use them ---

export const isSupabaseServerConfigured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const getSupabaseServer = () => {
    if(isSupabaseServerConfigured()) {
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    }
    return undefined;
}

export const supabaseServer = getSupabaseServer();