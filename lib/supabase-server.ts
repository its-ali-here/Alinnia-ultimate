import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers" // For Route Handler Client in Next.js App Router

// Helper function to create a Supabase client for server-side functions (e.g., Server Actions, Route Handlers)
// This client uses the user's session from cookies, respecting Row Level Security (RLS).
export const supabaseServer = () => {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables (public) are missing for supabaseServer.")
    // You might want to throw an error here, depending on how strictly you want to enforce this check.
    // For now, we'll let it proceed, but be aware it won't connect without these.
    throw new Error("Supabase public environment variables not configured.")
  }

  // Use createClient for Next.js Route Handlers/Server Components with cookies
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Sessions are handled by cookies in this context
      detectSessionInUrl: false,
    },
    global: {
      headers: { Cookie: cookieStore.toString() }, // Pass cookies for session
    },
  })
}

// Helper function to create a Supabase client with the Service Role Key.
// This client bypasses Row Level Security (RLS) and should only be used in secure server environments (e.g., API routes).
export const supabaseAdmin = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Supabase Admin environment variables are missing (SUPABASE_SERVICE_ROLE_KEY).")
    // You might want to throw an error here, depending on how strictly you want to enforce this check.
    throw new Error("Supabase Admin environment variables not configured.")
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
})()

// Helpers to check if environment variables are configured
export const isSupabaseServerConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const isSupabaseAdminConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)