import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check environment variables on the server side only
    const envStatus = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      groqConfigured: !!process.env.GROQ_API_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    return NextResponse.json(envStatus)
  } catch (error) {
    console.error("Environment check error:", error)
    return NextResponse.json({ error: "Failed to check environment variables" }, { status: 500 })
  }
}
