// Environment variable validation
export const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
} as const

export const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

export const isEnvironmentConfigured = () => {
  return missingEnvVars.length === 0
}

export const getEnvironmentStatus = () => {
  return {
    supabaseUrl: !!requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    groqApiKey: !!requiredEnvVars.GROQ_API_KEY,
    allConfigured: isEnvironmentConfigured(),
    missing: missingEnvVars,
  }
}
