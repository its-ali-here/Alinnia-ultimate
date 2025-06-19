"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function looksLikeUrl(url: string | undefined) {
  return Boolean(url && /^https?:\/\/.+\..+/.test(url))
}

const PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const PUBLIC_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function isSupabaseConfigured(): boolean {
  return looksLikeUrl(PUBLIC_URL) && !!PUBLIC_ANON_KEY
}

/* ------------------------------------------------------------------ */
/*  Real client or safe stub                                          */
/* ------------------------------------------------------------------ */
function createStub(): SupabaseClient {
  // Minimal subset used in our codebase
  const noOp = () => {
    console.warn("[Supabase-STUB] Client not configured – env vars missing.")
    return { select: () => ({ data: null, error: new Error("Supabase not configured") }) }
  }
  // @ts-expect-error – we purposely cheat for the stub
  return {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => {},
      getSession: async () => ({ data: { user: null }, error: null }),
      refreshSession: async () => {},
    },
    from: () => ({ select: noOp, insert: noOp, update: noOp, delete: noOp, eq: () => ({}) }),
  }
}

export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createBrowserClient(PUBLIC_URL!, PUBLIC_ANON_KEY!)
  : createStub()
