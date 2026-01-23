"use server"

import { createSupabaseAdminClient } from "@/lib/supabase-server"

// These actions are now mostly handled by API routes
// Keep only what's needed for server components

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
      return { error: "Could not fetch Google Sheets." }
    }

    return { data: sheets || [] }
  } catch (error) {
    return { error: "An unexpected error occurred." }
  }
}

// Deprecated - use API route instead
export async function syncGoogleSheetsAction(organizationId: string, userId: string) {
  console.warn('syncGoogleSheetsAction is deprecated. Use /api/data-sources/sync-google instead.')
  return { error: "Please use the API route instead." }
}

export async function refreshSheetCacheAction(googleSheetId: string, userId: string) {
  if (!googleSheetId || !userId) {
    return { error: "Google Sheet ID and User ID are required." }
  }

  const supabase = createSupabaseAdminClient()

  try {
    await supabase
      .from('sheet_data_cache')
      .delete()
      .eq('google_sheet_id', googleSheetId)

    await supabase
      .from('google_sheets')
      .update({ updated_at: new Date().toISOString() })
      .eq('google_sheet_id', googleSheetId)

    return { success: true }
  } catch (error) {
    return { error: `Failed to refresh: ${(error as Error).message}` }
  }
}
