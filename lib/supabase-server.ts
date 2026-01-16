/**
 * WARNING: This file uses next/headers and can ONLY be imported in:
 * - App Router Server Components (app/ directory)
 * - App Router Route Handlers (app/api/ directory)
 * 
 * DO NOT import this file in:
 * - pages/ directory files
 * - Client Components ('use client')
 * - middleware.ts
 * 
 * For the admin client only, use: import { createSupabaseAdminClient } from '@/lib/supabase-admin'
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Re-export admin client for backward compatibility
export { createSupabaseAdminClient } from './supabase-admin'

// Only use this in App Router Server Components and Route Handlers
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}