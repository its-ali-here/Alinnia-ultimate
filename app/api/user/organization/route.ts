import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  try {
    // Get user from session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ organization: null, error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to fetch organization membership
    const supabaseAdmin = createSupabaseAdminClient()

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('organization_members')
      .select(`
        organization_id,
        role,
        designation,
        organizations (
          id,
          name,
          organization_code,
          onboarding_completed
        )
      `)
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (membershipError) {
      // PGRST116 means no rows found - user has no organization
      if (membershipError.code === 'PGRST116') {
        return NextResponse.json({ organization: null })
      }
      console.error('Error fetching organization:', membershipError)
      return NextResponse.json({ organization: null, error: membershipError.message }, { status: 500 })
    }

    return NextResponse.json({
      organization: membership ? {
        organization_id: membership.organization_id,
        role: membership.role,
        designation: membership.designation,
        ...membership.organizations
      } : null
    })

  } catch (error) {
    console.error('User organization API error:', error)
    return NextResponse.json(
      { organization: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
