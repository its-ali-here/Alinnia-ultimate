import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Get user from Supabase session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: {
          userError: userError?.message,
          hasUser: !!user
        }
      }, { status: 401 })
    }

    console.log('Debug API - User:', user.email)

    const supabaseAdmin = createSupabaseAdminClient()

    // Check organization membership
    const { data: orgMemberships, error: orgError } = await supabaseAdmin
      .from('organization_members')
      .select(`
        role,
        organization:organizations(*)
      `)
      .eq('user_id', user.id)

    if (orgError) {
      console.error('Organization membership error:', orgError)
      return NextResponse.json({
        error: 'Database error',
        debug: {
          orgError: orgError.message
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      debug: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        organizationMemberships: orgMemberships || [],
        hasOrganization: orgMemberships && orgMemberships.length > 0,
        membershipCount: orgMemberships?.length || 0
      }
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to debug user organization',
        debug: {
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
}
