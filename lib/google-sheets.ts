import { google } from 'googleapis'
import { createSupabaseAdminClient } from './supabase-server'

// Helper to refresh Google access token
async function refreshGoogleToken(userId: string, refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    const tokens = await response.json()

    if (!response.ok) {
      console.error('Failed to refresh Google token:', tokens)
      return null
    }

    // Update the token in database
    const supabase = createSupabaseAdminClient()
    await supabase
      .from('user_integrations')
      .update({
        access_token: tokens.access_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', 'google')

    return tokens.access_token
  } catch (error) {
    console.error('Error refreshing Google token:', error)
    return null
  }
}

// Get Google integration for a user
export async function getGoogleIntegration(userId: string) {
  const supabase = createSupabaseAdminClient()

  const { data: integration, error } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single()

  if (error || !integration) {
    return null
  }

  // Check if token is expired and refresh if needed
  const isExpired = integration.token_expires_at
    ? new Date(integration.token_expires_at) < new Date()
    : false

  if (isExpired && integration.refresh_token) {
    const newAccessToken = await refreshGoogleToken(userId, integration.refresh_token)
    if (newAccessToken) {
      integration.access_token = newAccessToken
    } else {
      return null // Token refresh failed
    }
  }

  return integration
}

export async function getGoogleSheetsClient(userId: string) {
  const integration = await getGoogleIntegration(userId)

  if (!integration) {
    throw new Error('Google Sheets not connected. Please connect your Google account in Settings.')
  }

  console.log('Creating OAuth2 client with credentials for user:', userId)
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  auth.setCredentials({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
  })

  console.log('OAuth2 client created, returning sheets client')
  return google.sheets({ version: 'v4', auth })
}

export async function getGoogleDriveClient(userId: string) {
  const integration = await getGoogleIntegration(userId)

  if (!integration) {
    throw new Error('Google Sheets not connected. Please connect your Google account in Settings.')
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  auth.setCredentials({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
  })

  return google.drive({ version: 'v3', auth })
}

export async function listGoogleSheets(userId: string) {
  try {
    console.log('Getting Google Drive client for user:', userId)
    const drive = await getGoogleDriveClient(userId)
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

export async function getSheetDataWithCache(userId: string, googleSheetId: string, range = 'Sheet1') {
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
    const freshData = await getSheetData(userId, googleSheetId, range)

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

export async function getSheetData(userId: string, spreadsheetId: string, range: string = 'A1:Z1000') {
  try {
    const sheets = await getGoogleSheetsClient(userId)

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

export async function getSheetMetadata(userId: string, spreadsheetId: string) {
  try {
    const sheets = await getGoogleSheetsClient(userId)

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

// Force refresh sheet data (invalidate cache and fetch fresh)
export async function refreshSheetData(userId: string, googleSheetId: string, range = 'Sheet1') {
  const supabase = createSupabaseAdminClient()

  // Delete cached data
  await supabase
    .from('sheet_data_cache')
    .delete()
    .eq('google_sheet_id', googleSheetId)
    .eq('range_name', range)

  // Fetch fresh data
  return getSheetDataWithCache(userId, googleSheetId, range)
}
