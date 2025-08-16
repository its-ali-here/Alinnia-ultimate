import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getGoogleSheetsClient() {
  const session = await getServerSession(authOptions)

  console.log('Getting Google Sheets client - Session check:', {
    hasSession: !!session,
    hasAccessToken: !!session?.accessToken,
    hasRefreshToken: !!session?.refreshToken,
    userEmail: session?.user?.email
  })

  if (!session) {
    throw new Error('No session found')
  }

  if (!session.accessToken) {
    throw new Error('No access token available in session')
  }

  console.log('Creating OAuth2 client with credentials')
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  auth.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  })

  console.log('OAuth2 client created, returning sheets client')
  return google.sheets({ version: 'v4', auth })
}

export async function getGoogleDriveClient() {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No access token available')
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  auth.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  })

  return google.drive({ version: 'v3', auth })
}

export async function listGoogleSheets() {
  try {
    console.log('Getting Google Drive client...')
    const drive = await getGoogleDriveClient()
    console.log('Google Drive client obtained')

    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 50,
    })

    console.log('Google Sheets API response:', response.data.files?.length || 0, 'files')
    return response.data.files || []
  } catch (error) {
    console.error('Error listing Google Sheets:', error)
    throw error
  }
}

export async function getSheetDataWithCache(googleSheetId: string, range = 'Sheet1') {
  const { createSupabaseAdminClient } = await import('@/lib/supabase-server')
  const supabase = createSupabaseAdminClient()

  try {
    // Check cache first
    const { data: cached } = await supabase
      .from('sheet_data_cache')
      .select('*')
      .eq('google_sheet_id', googleSheetId)
      .eq('range_name', range)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cached) {
      console.log('Using cached data for sheet:', googleSheetId)
      return {
        data: cached.data,
        columnDefinitions: cached.column_definitions,
        rowCount: cached.row_count,
        fromCache: true
      }
    }

    // Cache miss or expired - fetch fresh data
    console.log('Fetching fresh data for sheet:', googleSheetId)
    const freshData = await getSheetData(googleSheetId, range)

    // Process and cache the data
    const processedData = processSheetData(freshData)

    // Store in cache
    await supabase
      .from('sheet_data_cache')
      .upsert({
        google_sheet_id: googleSheetId,
        range_name: range,
        data: processedData.data,
        column_definitions: processedData.columnDefinitions,
        row_count: processedData.rowCount,
        last_fetched: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      })

    return {
      ...processedData,
      fromCache: false
    }
  } catch (error) {
    console.error('Error getting sheet data with cache:', error)
    throw error
  }
}

function processSheetData(rawData: any[][]) {
  if (!rawData || rawData.length === 0) {
    return { data: [], columnDefinitions: [], rowCount: 0 }
  }

  // First row as headers
  const headers = rawData[0] || []
  const dataRows = rawData.slice(1)

  // Create column definitions
  const columnDefinitions = headers.map((header, index) => ({
    name: header || `Column_${index + 1}`,
    type: inferColumnType(dataRows.map(row => row[index]))
  }))

  // Convert to objects
  const data = dataRows.map(row => {
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header || `Column_${index + 1}`] = row[index] || null
    })
    return obj
  })

  return {
    data,
    columnDefinitions,
    rowCount: dataRows.length
  }
}

function inferColumnType(values: any[]): string {
  // Simple type inference
  const nonNullValues = values.filter(v => v != null && v !== '')
  if (nonNullValues.length === 0) return 'text'

  const isAllNumbers = nonNullValues.every(v => !isNaN(Number(v)))
  if (isAllNumbers) return 'number'

  const isAllDates = nonNullValues.every(v => !isNaN(Date.parse(v)))
  if (isAllDates) return 'date'

  return 'text'
}

export async function getSheetData(spreadsheetId: string, range: string = 'A1:Z1000') {
  try {
    const sheets = await getGoogleSheetsClient()
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    return response.data.values || []
  } catch (error) {
    console.error('Error getting sheet data:', error)
    throw error
  }
}

export async function getSheetMetadata(spreadsheetId: string) {
  try {
    const sheets = await getGoogleSheetsClient()
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'properties,sheets.properties',
    })

    return response.data
  } catch (error) {
    console.error('Error getting sheet metadata:', error)
    throw error
  }
}
