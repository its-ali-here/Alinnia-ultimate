/**
 * Server-side Supabase utilities.
 * 
 * WARNING: createSupabaseServerClient uses next/headers and can ONLY be used in:
 * - App Router Server Components (app/ directory)
 * - App Router Route Handlers (app/api/ directory)
 */

import { createServerClient } from '@supabase/ssr'

// Re-export admin client for convenience
export { createSupabaseAdminClient } from './supabase-admin'

// Server client with user session (for Route Handlers only)
export async function createSupabaseServerClient() {
  // Dynamic import to avoid bundling next/headers in pages directory
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch { /* Ignore in Server Components */ }
        },
      },
    }
  )
}