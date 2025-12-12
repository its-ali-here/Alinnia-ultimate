import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// This route checks the status of the Google integration
export async function GET(request: NextRequest) {
  try {
    // Get the current user from Supabase session
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the integration status
    const adminSupabase = createSupabaseAdminClient()
    
    const { data: integration, error } = await adminSupabase
      .from('user_integrations')
      .select('provider_email, connected_at, token_expires_at, scopes')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching integration status:', error)
      return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
    }

    if (!integration) {
      return NextResponse.json({ 
        connected: false,
        email: null,
        connectedAt: null,
      })
    }

    // Check if token is expired
    const isExpired = integration.token_expires_at 
      ? new Date(integration.token_expires_at) < new Date()
      : false

    return NextResponse.json({
      connected: true,
      email: integration.provider_email,
      connectedAt: integration.connected_at,
      tokenExpired: isExpired,
      scopes: integration.scopes,
    })
  } catch (error) {
    console.error('Error checking Google integration status:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}

