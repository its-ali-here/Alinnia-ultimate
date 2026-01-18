import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey)

// Single browser client instance
export const supabase = isSupabaseConfigured()
  ? createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  : createMockClient()

// Also export a function for consistency with other patterns
export const createSupabaseBrowserClient = () => supabase

function createMockClient() {
  console.warn("Supabase not configured. Using mock client.")
  const mockResponse = { data: null, error: { message: "Supabase not configured" } }
  const mockChain = {
    select: () => mockChain,
    insert: () => mockChain,
    update: () => mockChain,
    delete: () => mockChain,
    eq: () => mockChain,
    single: () => Promise.resolve(mockResponse),
    maybeSingle: () => Promise.resolve(mockResponse),
    then: (resolve: any) => resolve(mockResponse),
  }
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => mockChain,
    storage: { from: () => ({ upload: async () => mockResponse, download: async () => mockResponse, remove: async () => mockResponse }) },
    functions: { invoke: async () => mockResponse },
    channel: () => ({ on: () => ({ subscribe: () => {} }) }),
    removeChannel: () => {},
  } as any
}
