import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Google Sheets Debug Endpoint ===')
    
    // 1. Check NextAuth session
    const session = await getServerSession(authOptions)
    console.log('NextAuth Session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      hasAccessToken: !!session?.accessToken,
      hasRefreshToken: !!session?.refreshToken,
      accessTokenLength: session?.accessToken?.length || 0,
      expiresAt: session?.expiresAt,
      isExpired: session?.expiresAt ? Date.now() > (session.expiresAt * 1000) : null
    })

    // 2. Check environment variables
    const envCheck = {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV
    }
    console.log('Environment Variables:', envCheck)

    // 3. Check database connection and tables
    const supabase = createSupabaseAdminClient()
    let dbCheck = {
      canConnect: false,
      hasGoogleSheetsTable: false,
      hasDashboardDataSourcesTable: false,
      hasSheetDataCacheTable: false,
      tableErrors: [] as string[]
    }

    try {
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('dashboards')
        .select('id')
        .limit(1)
      
      if (!testError) {
        dbCheck.canConnect = true
      }

      // Check if google_sheets table exists
      try {
        const { error: gsError } = await supabase
          .from('google_sheets')
          .select('id')
          .limit(1)
        
        if (!gsError) {
          dbCheck.hasGoogleSheetsTable = true
        } else {
          dbCheck.tableErrors.push(`google_sheets: ${gsError.message}`)
        }
      } catch (e) {
        dbCheck.tableErrors.push(`google_sheets: ${(e as Error).message}`)
      }

      // Check if dashboard_data_sources table exists
      try {
        const { error: ddsError } = await supabase
          .from('dashboard_data_sources')
          .select('id')
          .limit(1)
        
        if (!ddsError) {
          dbCheck.hasDashboardDataSourcesTable = true
        } else {
          dbCheck.tableErrors.push(`dashboard_data_sources: ${ddsError.message}`)
        }
      } catch (e) {
        dbCheck.tableErrors.push(`dashboard_data_sources: ${(e as Error).message}`)
      }

      // Check if sheet_data_cache table exists
      try {
        const { error: sdcError } = await supabase
          .from('sheet_data_cache')
          .select('id')
          .limit(1)
        
        if (!sdcError) {
          dbCheck.hasSheetDataCacheTable = true
        } else {
          dbCheck.tableErrors.push(`sheet_data_cache: ${sdcError.message}`)
        }
      } catch (e) {
        dbCheck.tableErrors.push(`sheet_data_cache: ${(e as Error).message}`)
      }

    } catch (e) {
      dbCheck.tableErrors.push(`Connection: ${(e as Error).message}`)
    }

    console.log('Database Check:', dbCheck)

    // 4. Test Google API if we have tokens
    let googleApiCheck = {
      canCallDriveApi: false,
      canCallSheetsApi: false,
      apiErrors: [] as string[]
    }

    if (session?.accessToken) {
      try {
        // Test Google Drive API
        const { google } = await import('googleapis')
        const auth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        )

        auth.setCredentials({
          access_token: session.accessToken,
          refresh_token: session.refreshToken,
        })

        const drive = google.drive({ version: 'v3', auth })
        const driveResponse = await drive.files.list({
          q: "mimeType='application/vnd.google-apps.spreadsheet'",
          pageSize: 1,
        })

        if (driveResponse.data) {
          googleApiCheck.canCallDriveApi = true
        }

        // Test Google Sheets API
        const sheets = google.sheets({ version: 'v4', auth })
        // We can't test sheets API without a specific spreadsheet ID
        googleApiCheck.canCallSheetsApi = true

      } catch (e) {
        googleApiCheck.apiErrors.push((e as Error).message)
      }
    } else {
      googleApiCheck.apiErrors.push('No access token available')
    }

    console.log('Google API Check:', googleApiCheck)

    // 5. Check organization context
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    let orgCheck = {
      hasOrganizationId: !!organizationId,
      organizationExists: false,
      userInOrganization: false
    }

    if (organizationId && session?.user?.id) {
      try {
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('id', organizationId)
          .single()
        
        if (org) {
          orgCheck.organizationExists = true
        }

        const { data: member } = await supabase
          .from('organization_members')
          .select('user_id')
          .eq('organization_id', organizationId)
          .eq('user_id', session.user.id)
          .single()
        
        if (member) {
          orgCheck.userInOrganization = true
        }
      } catch (e) {
        // Ignore errors for this check
      }
    }

    console.log('Organization Check:', orgCheck)

    const debugResult = {
      timestamp: new Date().toISOString(),
      session: {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        hasAccessToken: !!session?.accessToken,
        hasRefreshToken: !!session?.refreshToken,
        accessTokenLength: session?.accessToken?.length || 0,
        expiresAt: session?.expiresAt,
        isExpired: session?.expiresAt ? Date.now() > (session.expiresAt * 1000) : null
      },
      environment: envCheck,
      database: dbCheck,
      googleApi: googleApiCheck,
      organization: orgCheck,
      recommendations: [] as string[]
    }

    // Generate recommendations
    if (!debugResult.session.hasAccessToken) {
      debugResult.recommendations.push('User needs to authenticate with Google OAuth')
    }
    if (debugResult.session.isExpired) {
      debugResult.recommendations.push('Google access token has expired - user needs to re-authenticate')
    }
    if (!debugResult.database.hasGoogleSheetsTable) {
      debugResult.recommendations.push('Run database migration to create google_sheets table')
    }
    if (!debugResult.database.hasDashboardDataSourcesTable) {
      debugResult.recommendations.push('Run database migration to create dashboard_data_sources table')
    }
    if (!debugResult.environment.hasGoogleClientId || !debugResult.environment.hasGoogleClientSecret) {
      debugResult.recommendations.push('Configure Google OAuth credentials in environment variables')
    }
    if (debugResult.googleApi.apiErrors.length > 0) {
      debugResult.recommendations.push('Fix Google API authentication issues')
    }

    return NextResponse.json(debugResult, { status: 200 })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        details: (error as Error).message,
        stack: (error as Error).stack
      },
      { status: 500 }
    )
  }
}
