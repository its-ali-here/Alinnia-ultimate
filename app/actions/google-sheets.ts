"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { listGoogleSheets } from "@/lib/google-sheets"

export async function syncGoogleSheetsAction(organizationId: string, userId: string) {
  if (!organizationId || !userId) {
    return { error: "Organization ID and User ID are required." }
  }

  const supabase = createSupabaseAdminClient()

  try {
    console.log('Syncing Google Sheets for organization:', organizationId, 'user:', userId)

    // Get current Google Sheets from Google API (using userId for token lookup)
    const googleSheets = await listGoogleSheets(userId)
    console.log('Found Google Sheets:', googleSheets.length)

    // Get existing sheets in our database for this organization
    const { data: existingSheets } = await supabase
      .from('google_sheets')
      .select('google_sheet_id, name, last_modified')
      .eq('organization_id', organizationId)

    const existingSheetIds = new Set(existingSheets?.map(s => s.google_sheet_id) || [])

    // Process each sheet from Google
    const syncResults = []
    for (const sheet of googleSheets) {
      try {
        const sheetData = {
          google_sheet_id: sheet.id,
          name: sheet.name,
          organization_id: organizationId,
          created_by: userId,
          web_view_link: sheet.webViewLink,
          last_modified: sheet.modifiedTime ? new Date(sheet.modifiedTime).toISOString() : null,
          updated_at: new Date().toISOString()
        }

        if (existingSheetIds.has(sheet.id)) {
          // Update existing sheet
          const { error } = await supabase
            .from('google_sheets')
            .update(sheetData)
            .eq('google_sheet_id', sheet.id)
            .eq('organization_id', organizationId)

          if (error) {
            console.error('Error updating sheet:', sheet.id, error)
            syncResults.push({ id: sheet.id, status: 'error', error: error.message })
          } else {
            syncResults.push({ id: sheet.id, status: 'updated' })
          }
        } else {
          // Insert new sheet
          const { error } = await supabase
            .from('google_sheets')
            .insert(sheetData)

          if (error) {
            console.error('Error inserting sheet:', sheet.id, error)
            syncResults.push({ id: sheet.id, status: 'error', error: error.message })
          } else {
            syncResults.push({ id: sheet.id, status: 'created' })
          }
        }
      } catch (error) {
        console.error('Error processing sheet:', sheet.id, error)
        syncResults.push({ id: sheet.id, status: 'error', error: (error as Error).message })
      }
    }

    console.log('Sync results:', syncResults)
    return { 
      data: syncResults,
      summary: {
        total: googleSheets.length,
        created: syncResults.filter(r => r.status === 'created').length,
        updated: syncResults.filter(r => r.status === 'updated').length,
        errors: syncResults.filter(r => r.status === 'error').length
      }
    }
  } catch (error) {
    console.error('Error syncing Google Sheets:', error)
    return { error: `Failed to sync Google Sheets: ${(error as Error).message}` }
  }
}

export async function getGoogleSheetsAction(organizationId: string) {
  if (!organizationId) {
    return { error: "Organization ID is required." }
  }

  const supabase = createSupabaseAdminClient()

  try {
    const { data: sheets, error } = await supabase
      .from('google_sheets')
      .select('*')
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching Google Sheets:', error)
      return { error: "Could not fetch Google Sheets." }
    }

    return { data: sheets || [] }
  } catch (error) {
    console.error('Unexpected error fetching Google Sheets:', error)
    return { error: "An unexpected error occurred while fetching Google Sheets." }
  }
}

export async function refreshSheetCacheAction(googleSheetId: string, userId: string) {
  if (!googleSheetId || !userId) {
    return { error: "Google Sheet ID and User ID are required." }
  }

  const supabase = createSupabaseAdminClient()

  try {
    // Clear existing cache for this sheet
    await supabase
      .from('sheet_data_cache')
      .delete()
      .eq('google_sheet_id', googleSheetId)

    // Update the sheet's updated_at timestamp
    await supabase
      .from('google_sheets')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('google_sheet_id', googleSheetId)

    return { success: true, message: "Sheet cache refreshed successfully." }
  } catch (error) {
    console.error('Error refreshing sheet cache:', error)
    return { error: `Failed to refresh sheet cache: ${(error as Error).message}` }
  }
}

export async function removeGoogleSheetAction(googleSheetId: string, organizationId: string) {
  if (!googleSheetId || !organizationId) {
    return { error: "Google Sheet ID and Organization ID are required." }
  }

  const supabase = createSupabaseAdminClient()

  try {
    // Remove from any dashboards first
    await supabase
      .from('dashboard_data_sources')
      .delete()
      .eq('source_type', 'google_sheet')
      .eq('source_id', googleSheetId)

    // Remove the sheet record
    const { error } = await supabase
      .from('google_sheets')
      .delete()
      .eq('google_sheet_id', googleSheetId)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('Error removing Google Sheet:', error)
      return { error: "Could not remove Google Sheet." }
    }

    return { success: true, message: "Google Sheet removed successfully." }
  } catch (error) {
    console.error('Unexpected error removing Google Sheet:', error)
    return { error: "An unexpected error occurred while removing Google Sheet." }
  }
}
