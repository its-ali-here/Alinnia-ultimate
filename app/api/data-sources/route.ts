import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getGoogleIntegration } from '@/lib/google-sheets'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    console.log('Data sources API - User:', user.email)

    const supabaseAdmin = createSupabaseAdminClient()
    const allDataSources = []

    // Fetch CSV files from Supabase
    try {
      const { data: csvFiles, error: csvError } = await supabaseAdmin
        .from('datasources')
        .select('id, file_name, status, row_count, created_at, storage_path, date_format')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (csvError) {
        console.error('Error fetching CSV files:', csvError)
      } else if (csvFiles) {
        // Transform CSV files to unified format and get file sizes
        const csvDataSources = await Promise.all(csvFiles.map(async (file) => {
          let fileSize = 'Unknown'

          // Try to get file size from storage
          if (file.storage_path && file.storage_path !== 'pending') {
            try {
              const { data: fileInfo, error: sizeError } = await supabaseAdmin.storage
                .from('files')
                .list(file.storage_path.split('/').slice(0, -1).join('/'), {
                  search: file.storage_path.split('/').pop()
                })

              if (!sizeError && fileInfo && fileInfo.length > 0) {
                const sizeInBytes = fileInfo[0].metadata?.size
                if (sizeInBytes) {
                  const sizeInMB = sizeInBytes / (1024 * 1024)
                  fileSize = `${sizeInMB.toFixed(1)} MB`
                }
              }
            } catch (error) {
              console.error('Error getting file size:', error)
            }
          }

          return {
            id: file.id,
            name: file.file_name,
            source: 'CSV' as const,
            size: fileSize,
            uploadedAt: file.created_at,
            status: file.status,
            rowCount: file.row_count,
            metadata: {
              dateFormat: file.date_format,
              storagePath: file.storage_path
            }
          }
        }))
        allDataSources.push(...csvDataSources)
      }
    } catch (error) {
      console.error('Error processing CSV files:', error)
    }

    // Check if user has Google integration and fetch sheets
    const integration = await getGoogleIntegration(user.id)

    if (integration) {
      try {
        console.log('Fetching Google Sheets from database for organization:', organizationId)

        // Fetch Google Sheets from the database
        const { data: existingSheets, error: sheetsError } = await supabaseAdmin
          .from('google_sheets')
          .select('*')
          .eq('organization_id', organizationId)
          .order('updated_at', { ascending: false })

        if (sheetsError) {
          console.error('Error fetching Google Sheets from database:', sheetsError)
        } else {
          console.log('Google Sheets fetched from database:', existingSheets?.length || 0)

          // If no sheets in database but user has integration, try to sync
          if (!existingSheets || existingSheets.length === 0) {
            console.log('No Google Sheets in database, attempting auto-sync...')
            try {
              const { syncGoogleSheetsAction } = await import('@/app/actions/google-sheets')
              const syncResult = await syncGoogleSheetsAction(organizationId, user.id)

              if (!syncResult.error && syncResult.data) {
                console.log('Auto-sync completed:', syncResult.summary)
                // Re-fetch the sheets after sync
                const { data: syncedSheets } = await supabaseAdmin
                  .from('google_sheets')
                  .select('*')
                  .eq('organization_id', organizationId)
                  .order('updated_at', { ascending: false })

                if (syncedSheets) {
                  // Transform Google Sheets to unified format
                  const sheetsDataSources = syncedSheets.map((sheet: any) => ({
                    id: sheet.google_sheet_id,
                    name: sheet.name,
                    source: 'Google Sheets' as const,
                    size: 'Google Sheet',
                    uploadedAt: sheet.created_at,
                    status: 'ready' as const,
                    rowCount: null,
                    metadata: {
                      webViewLink: sheet.web_view_link,
                      googleSheetId: sheet.google_sheet_id,
                      lastModified: sheet.last_modified,
                      internalId: sheet.id
                    }
                  }))
                  allDataSources.push(...sheetsDataSources)
                }
              }
            } catch (syncError) {
              console.error('Auto-sync failed:', syncError)
            }
          } else {
            // Transform existing Google Sheets to unified format
            const sheetsDataSources = existingSheets.map((sheet: any) => ({
              id: sheet.google_sheet_id,
              name: sheet.name,
              source: 'Google Sheets' as const,
              size: 'Google Sheet',
              uploadedAt: sheet.created_at,
              status: 'ready' as const,
              rowCount: null,
              metadata: {
                webViewLink: sheet.web_view_link,
                googleSheetId: sheet.google_sheet_id,
                lastModified: sheet.last_modified,
                internalId: sheet.id
              }
            }))
            allDataSources.push(...sheetsDataSources)
            console.log('Added Google Sheets to data sources:', sheetsDataSources.length)
          }
        }
      } catch (error) {
        console.error('Error fetching Google Sheets:', error)
      }
    } else {
      console.log('No Google integration, skipping Google Sheets')
    }

    // Sort all data sources by upload date (most recent first)
    allDataSources.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({ dataSources: allDataSources })
  } catch (error) {
    console.error('Data sources API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    )
  }
}
