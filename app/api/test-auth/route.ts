import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Log all cookies for debugging
    const allCookies = cookieStore.getAll()
    console.log('All cookies:', allCookies.map(c => ({ name: c.name, value: c.value?.substring(0, 20) + '...' })))
    
    // Check for specific Supabase cookies
    const hasAccessToken = cookieStore.has('sb-access-token')
    const hasRefreshToken = cookieStore.has('sb-refresh-token')
    
    return NextResponse.json({
      success: true,
      cookies: {
        total: allCookies.length,
        hasAccessToken,
        hasRefreshToken,
        cookieNames: allCookies.map(c => c.name)
      }
    })
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
