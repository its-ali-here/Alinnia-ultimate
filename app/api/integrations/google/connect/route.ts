import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// This route initiates the Google OAuth flow for connecting Google Sheets as an integration
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

    // Build Google OAuth URL
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/google/callback`
    
    if (!clientId) {
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
    }

    // Scopes for Google Sheets and Drive (read-only for Drive to list files)
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' ')

    // Create state parameter with user ID for security
    const state = Buffer.from(JSON.stringify({ 
      userId: user.id,
      timestamp: Date.now(),
    })).toString('base64')

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent') // Force consent to get refresh token
    authUrl.searchParams.set('state', state)

    return NextResponse.json({ authUrl: authUrl.toString() })
  } catch (error) {
    console.error('Error initiating Google OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Google connection' },
      { status: 500 }
    )
  }
}

