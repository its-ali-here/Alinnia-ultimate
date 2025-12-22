import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orgName } = body

    if (!orgName) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    const supabaseAdmin = createSupabaseAdminClient()

    // Create organization
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: orgName,
        owner_id: user.id,
        email: user.email || '',
        industry: 'Technology',
        city: 'Not specified',
        country: 'Not specified',
        organization_code: Math.random().toString(36).substring(2, 8).toUpperCase()
      })
      .select()
      .single()

    if (orgError) {
      console.error('Error creating organization:', orgError)
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
    }

    // Add user as owner
    const { error: memberError } = await supabaseAdmin
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner'
      })

    if (memberError) {
      console.error('Error adding user to organization:', memberError)
      return NextResponse.json({ error: 'Failed to add user to organization' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      organization: org
    })

  } catch (error) {
    console.error('Create organization error:', error)
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    )
  }
}
