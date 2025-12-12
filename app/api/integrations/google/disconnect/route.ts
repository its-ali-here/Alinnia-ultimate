import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// This route disconnects the Google integration
export async function POST(request: NextRequest) {
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

    // Get the integration to revoke the token
    const adminSupabase = createSupabaseAdminClient()
    
    const { data: integration } = await adminSupabase
      .from('user_integrations')
      .select('access_token')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .single()

    // Revoke the token with Google (best effort)
    if (integration?.access_token) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${integration.access_token}`, {
          method: 'POST',
        })
      } catch (e) {
        console.warn('Failed to revoke Google token:', e)
      }
    }

    // Delete the integration from database
    const { error: deleteError } = await adminSupabase
      .from('user_integrations')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', 'google')

    if (deleteError) {
      console.error('Failed to delete integration:', deleteError)
      return NextResponse.json(
        { error: 'Failed to disconnect Google' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Google:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Google' },
      { status: 500 }
    )
  }
}

