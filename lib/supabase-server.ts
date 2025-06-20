/// ─── HELPERS ───────────────────────────────────────────────────────────────────
export const isSupabaseServerConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const isSupabaseAdminConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

// ─── EXPLICIT EXPORTS ----------------------------------------------------------
const supabaseServer = {} // Placeholder for actual implementation
const supabaseAdmin = {} // Placeholder for actual implementation

export { supabaseServer, supabaseAdmin }
