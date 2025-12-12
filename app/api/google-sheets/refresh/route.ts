import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getGoogleIntegration } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    // Get user from Supabase session
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

    // Check if user has Google integration connected
    const integration = await getGoogleIntegration(user.id)
    if (!integration) {
      return NextResponse.json({ 
        error: 'Google Sheets not connected',
        needsConnection: true 
      }, { status: 401 })
    }

    const body = await request.json()
    const { googleSheetId, range, refreshAll } = body

    const adminSupabase = createSupabaseAdminClient()

    if (refreshAll) {
      // Refresh all Google Sheets for the user's organization
      const { data: orgMember } = await adminSupabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (!orgMember) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
      }

      // Get all sheets for the organization
      const { data: sheets } = await adminSupabase
        .from('google_sheets')
        .select('google_sheet_id, name')
        .eq('organization_id', orgMember.organization_id)

      if (!sheets || sheets.length === 0) {
        return NextResponse.json({ message: 'No sheets to refresh', refreshed: 0 })
      }

      // Clear cache for all sheets
      for (const sheet of sheets) {
        await adminSupabase
          .from('sheet_data_cache')
          .delete()
          .eq('google_sheet_id', sheet.google_sheet_id)

        // Update the updated_at timestamp
        try {
          await adminSupabase
            .from('google_sheets')
            .update({
              updated_at: new Date().toISOString()
            })
            .eq('google_sheet_id', sheet.google_sheet_id)
        } catch (err) {
          console.error(`Failed to update timestamp for sheet ${sheet.google_sheet_id}:`, err)
        }
      }

      return NextResponse.json({ 
        message: 'All sheets refreshed',
        refreshed: sheets.length,
        sheets: sheets.map(s => s.name)
      })
    }

    // Refresh single sheet
    if (!googleSheetId) {
      return NextResponse.json({ error: 'Google Sheet ID required' }, { status: 400 })
    }

    // Clear cache for the specific sheet
    await adminSupabase
      .from('sheet_data_cache')
      .delete()
      .eq('google_sheet_id', googleSheetId)

    // Update the updated_at timestamp
    await adminSupabase
      .from('google_sheets')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('google_sheet_id', googleSheetId)

    // Optionally fetch fresh data for the specified range
    let freshData = null
    if (range) {
      const { getSheetData } = await import('@/lib/google-sheets')
      freshData = await getSheetData(user.id, googleSheetId, range)
    }

    return NextResponse.json({ 
      message: 'Sheet refreshed successfully',
      data: freshData
    })
  } catch (error) {
    console.error('Google Sheets refresh error:', error)
    return NextResponse.json(
      {
        error: 'Failed to refresh Google Sheets data',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}

