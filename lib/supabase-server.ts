import { createClient } from "@supabase/supabase-js"

// Environment variable validation for server-side
const serverRequiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}

// Check for missing environment variables
const missingServerEnvVars = Object.entries(serverRequiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingServerEnvVars.length > 0) {
  console.warn(`Missing server environment variables: ${missingServerEnvVars.join(", ")}`)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Server-side client with service role key for admin operations
export const supabaseAdmin = (() => {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase admin client not configured - missing environment variables")
    return null
  }

  try {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("Failed to create Supabase admin client:", error)
    return null
  }
})()

// Client-side compatible server client
export const supabaseServer = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase server client not configured - missing environment variables")
    return null
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  } catch (error) {
    console.error("Failed to create Supabase server client:", error)
    return null
  }
})()
