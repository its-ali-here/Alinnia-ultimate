import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { data, error } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
        console.error("Error checking organization in API route:", error)
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new NextResponse(JSON.stringify({ organization: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("Error in GET /api/user/organization:", error)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
