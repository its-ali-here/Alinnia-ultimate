import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { listGoogleSheets, getSheetData, getSheetMetadata, getGoogleIntegration } from '@/lib/google-sheets'

export async function GET(request: NextRequest) {
  try {
    console.log('Google Sheets API called')

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
      console.log('Google Sheets API - No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has Google integration connected
    const integration = await getGoogleIntegration(user.id)
    if (!integration) {
      console.log('Google Sheets API - No Google integration found')
      return NextResponse.json({
        error: 'Google Sheets not connected',
        needsConnection: true
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const spreadsheetId = searchParams.get('spreadsheetId')
    const range = searchParams.get('range')

    console.log('Google Sheets API - Action:', action, 'User:', user.id)

    switch (action) {
      case 'list':
        console.log('Google Sheets API - Listing sheets...')
        const sheets = await listGoogleSheets(user.id)
        console.log('Google Sheets API - Found sheets:', sheets.length)
        return NextResponse.json({ sheets })

      case 'data':
        if (!spreadsheetId) {
          return NextResponse.json({ error: 'Spreadsheet ID required' }, { status: 400 })
        }
        console.log('Google Sheets API - Getting data for sheet:', spreadsheetId)
        const data = await getSheetData(user.id, spreadsheetId, range || undefined)
        return NextResponse.json({ data })

      case 'metadata':
        if (!spreadsheetId) {
          return NextResponse.json({ error: 'Spreadsheet ID required' }, { status: 400 })
        }
        console.log('Google Sheets API - Getting metadata for sheet:', spreadsheetId)
        const metadata = await getSheetMetadata(user.id, spreadsheetId)
        return NextResponse.json({ metadata })

      default:
        console.log('Google Sheets API - Invalid action:', action)
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Google Sheets API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process Google Sheets request',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}
