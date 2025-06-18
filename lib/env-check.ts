// Environment variable validation

// This function is intended for SERVER-SIDE USE ONLY.
// It checks all environment variables, including server-only ones.
export const getServerSideEnvStatus = () => {
  const allVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    // Add other server-only keys here if needed for a comprehensive check
  }

  const missing = Object.entries(allVars)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  return {
    isSupabasePublicConfigured: !!allVars.NEXT_PUBLIC_SUPABASE_URL && !!allVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    isGroqConfigured: !!allVars.GROQ_API_KEY,
    allRequiredServerVarsConfigured: missing.length === 0,
    missingServerVars: missing, // Be cautious about exposing this list directly to the client
  }
}

// This function can be safely used on the CLIENT-SIDE.
// It ONLY checks NEXT_PUBLIC_ prefixed environment variables.
export const getClientSidePublicEnvStatus = () => {
  const publicVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
  const missing = Object.entries(publicVars)
    .filter(([, value]) => !value)
    .map(([key]) => key)
  return {
    isSupabasePublicConfigured: !!publicVars.NEXT_PUBLIC_SUPABASE_URL && !!publicVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    allPublicVarsConfigured: missing.length === 0,
    missingPublicVars: missing,
  }
}

// Deprecated: To avoid confusion and client-side access to server keys.
// export const requiredEnvVars = { ... };
// export const missingEnvVars = ...;
// export const isEnvironmentConfigured = () => { ... };
// export const getEnvironmentStatus = () => { ... };
