import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listGoogleSheets, getSheetData, getSheetMetadata } from '@/lib/google-sheets'

export async function GET(request: NextRequest) {
  try {
    console.log('Google Sheets API called')
    const session = await getServerSession(authOptions)

    console.log('Google Sheets API - Session check:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      hasRefreshToken: !!session?.refreshToken,
      userEmail: session?.user?.email
    })

    if (!session) {
      console.log('Google Sheets API - No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.accessToken) {
      console.log('Google Sheets API - No access token found')
      return NextResponse.json({ error: 'No Google access token found' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const spreadsheetId = searchParams.get('spreadsheetId')
    const range = searchParams.get('range')

    console.log('Google Sheets API - Action:', action)

    switch (action) {
      case 'list':
        console.log('Google Sheets API - Listing sheets...')
        const sheets = await listGoogleSheets()
        console.log('Google Sheets API - Found sheets:', sheets.length)
        return NextResponse.json({ sheets })

      case 'data':
        if (!spreadsheetId) {
          return NextResponse.json({ error: 'Spreadsheet ID required' }, { status: 400 })
        }
        console.log('Google Sheets API - Getting data for sheet:', spreadsheetId)
        const data = await getSheetData(spreadsheetId, range || undefined)
        return NextResponse.json({ data })

      case 'metadata':
        if (!spreadsheetId) {
          return NextResponse.json({ error: 'Spreadsheet ID required' }, { status: 400 })
        }
        console.log('Google Sheets API - Getting metadata for sheet:', spreadsheetId)
        const metadata = await getSheetMetadata(spreadsheetId)
        return NextResponse.json({ metadata })

      default:
        console.log('Google Sheets API - Invalid action:', action)
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Google Sheets API error:', error)
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    })
    return NextResponse.json(
      {
        error: 'Failed to process Google Sheets request',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}
