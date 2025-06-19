import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

// Server-side environment variables (prioritize non-NEXT_PUBLIC for server)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

let serverSupabaseInstance: ReturnType<typeof createServerClient> | null = null
let serverSupabaseAdminInstance: ReturnType<typeof createServerClient> | null = null

function isServerSupabaseConfigured(): boolean {
  const isConfigured = !!SUPABASE_URL && !!SUPABASE_ANON_KEY
  if (!isConfigured) {
    console.error("Supabase server client environment variables are missing.")
    console.error(
      "Missing server client environment variables: ",
      !SUPABASE_URL ? "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL" : "",
      !SUPABASE_ANON_KEY ? "SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY" : "",
    )
  }
  return isConfigured
}

function isServerSupabaseAdminConfigured(): boolean {
  const isConfigured = isServerSupabaseConfigured() && !!SUPABASE_SERVICE_ROLE_KEY
  if (!isConfigured) {
    console.error("Supabase admin client environment variables are missing.")
    console.error(
      "Missing admin environment variables: ",
      !SUPABASE_SERVICE_ROLE_KEY ? "SUPABASE_SERVICE_ROLE_KEY" : "",
    )
  }
  return isConfigured
}

export function createClient() {
  if (!isServerSupabaseConfigured()) {
    return null
  }
  if (!serverSupabaseInstance) {
    serverSupabaseInstance = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookies().set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          cookies().set(name, "", options)
        },
      },
    })
  }
  return serverSupabaseInstance
}

export function createAdminClient() {
  if (!isServerSupabaseAdminConfigured()) {
    return null
  }
  if (!serverSupabaseAdminInstance) {
    serverSupabaseAdminInstance = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookies().set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          cookies().set(name, "", options)
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      },
    })
  }
  return serverSupabaseAdminInstance
}

export const supabaseServer = createClient()
export const supabaseAdmin = createAdminClient()

if (!supabaseServer) {
  console.warn("Supabase server client not configured - missing environment variables.")
}
if (!supabaseAdmin) {
  console.warn("Supabase admin client not configured - missing environment variables.")
}
