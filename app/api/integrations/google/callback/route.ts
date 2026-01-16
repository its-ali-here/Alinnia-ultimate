import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

// This route handles the OAuth callback from Google
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        new URL('/dashboard/settings?tab=integrations&error=google_auth_denied', request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?tab=integrations&error=missing_params', request.url)
      )
    }

    // Decode and validate state
    let stateData: { userId: string; timestamp: number }
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    } catch {
      return NextResponse.redirect(
        new URL('/dashboard/settings?tab=integrations&error=invalid_state', request.url)
      )
    }

    // Check state is not too old (10 minutes)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?tab=integrations&error=state_expired', request.url)
      )
    }

    // Exchange code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/google/callback`

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for tokens:', tokens)
      return NextResponse.redirect(
        new URL('/dashboard/settings?tab=integrations&error=token_exchange_failed', request.url)
      )
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const userInfo = await userInfoResponse.json()

    // Store integration in database using admin client
    const supabase = createSupabaseAdminClient()
    
    const { error: upsertError } = await supabase
      .from('user_integrations')
      .upsert({
        user_id: stateData.userId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        scopes: tokens.scope?.split(' ') || [],
        provider_account_id: userInfo.id,
        provider_email: userInfo.email,
        connected_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider',
      })

    if (upsertError) {
      console.error('Failed to store integration:', upsertError)
      return NextResponse.redirect(
        new URL('/dashboard/settings?tab=integrations&error=storage_failed', request.url)
      )
    }

    // Redirect to settings with success
    return NextResponse.redirect(
      new URL('/dashboard/settings?tab=integrations&success=google_connected', request.url)
    )
  } catch (error) {
    console.error('Error in Google OAuth callback:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?tab=integrations&error=callback_failed', request.url)
    )
  }
}

