import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('Debug session endpoint called')
    const session = await getServerSession(authOptions)
    
    const debugInfo = {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      hasAccessToken: !!session?.accessToken,
      hasRefreshToken: !!session?.refreshToken,
      accessTokenLength: session?.accessToken?.length || 0,
      refreshTokenLength: session?.refreshToken?.length || 0,
      expiresAt: session?.expiresAt,
      currentTime: Date.now(),
      isExpired: session?.expiresAt ? Date.now() > (session.expiresAt * 1000) : null,
      environment: {
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    }
    
    console.log('Session debug info:', debugInfo)
    
    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to debug session',
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}
