import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { syncGoogleSheetsAction } from '@/app/actions/google-sheets'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Testing Google Sheets Integration ===')
    
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const action = searchParams.get('action') || 'check'

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()
    const results: any = {
      action,
      timestamp: new Date().toISOString(),
      session: {
        hasAccessToken: !!session.accessToken,
        userEmail: session.user?.email,
        isExpired: session.expiresAt ? Date.now() > (session.expiresAt * 1000) : null
      }
    }

    // Check database tables
    const tableChecks = {
      google_sheets: false,
      dashboard_data_sources: false,
      sheet_data_cache: false
    }

    try {
      await supabase.from('google_sheets').select('id').limit(1)
      tableChecks.google_sheets = true
    } catch (e) {
      console.log('google_sheets table missing')
    }

    try {
      await supabase.from('dashboard_data_sources').select('id').limit(1)
      tableChecks.dashboard_data_sources = true
    } catch (e) {
      console.log('dashboard_data_sources table missing')
    }

    try {
      await supabase.from('sheet_data_cache').select('id').limit(1)
      tableChecks.sheet_data_cache = true
    } catch (e) {
      console.log('sheet_data_cache table missing')
    }

    results.tables = tableChecks

    if (action === 'sync' && session.accessToken) {
      console.log('Testing sync functionality...')
      try {
        const syncResult = await syncGoogleSheetsAction(organizationId, session.user?.id || '')
        results.syncTest = syncResult
      } catch (e) {
        results.syncTest = { error: (e as Error).message }
      }
    }

    if (action === 'list' && session.accessToken) {
      console.log('Testing Google Sheets API...')
      try {
        const response = await fetch(`${request.url.split('/api/')[0]}/api/google-sheets?action=list`, {
          headers: {
            'Cookie': request.headers.get('Cookie') || ''
          }
        })
        const data = await response.json()
        results.apiTest = {
          status: response.status,
          data: data
        }
      } catch (e) {
        results.apiTest = { error: (e as Error).message }
      }
    }

    // Get current Google Sheets in database
    if (tableChecks.google_sheets) {
      try {
        const { data: sheets } = await supabase
          .from('google_sheets')
          .select('*')
          .eq('organization_id', organizationId)
        
        results.currentSheets = sheets || []
      } catch (e) {
        results.currentSheets = { error: (e as Error).message }
      }
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}
