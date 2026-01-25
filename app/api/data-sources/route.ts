import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getGoogleIntegration, listGoogleSheets } from '@/lib/google-sheets' // added listGoogleSheets

// Helper function to format file size
function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

const STORAGE_LIMITS: Record<string, number> = {
  starter: 500 * 1024 * 1024,   // 500MB
  pro: 5000 * 1024 * 1024, // 5GB
  enterprise: 10 * 1024 * 1024 * 1024 // 10GB
}

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
    let totalStorageUsed = 0

    // Get organization plan for storage limit
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('plan')
      .eq('id', organizationId)
      .single()
    
    const plan = org?.plan || 'starter'
    const storageLimit = STORAGE_LIMITS[plan] || STORAGE_LIMITS.starter

    // Fetch CSV files from Supabase
    try {
      const { data: csvFiles, error: csvError } = await supabaseAdmin
        .from('datasources')
        .select('id, file_name, status, row_count, created_at, storage_path, file_size')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (csvError) {
        console.error('Error fetching CSV files:', csvError)
      } else if (csvFiles) {
        for (const file of csvFiles) {
          const sizeBytes = file.file_size || 0
          totalStorageUsed += sizeBytes
          allDataSources.push({
            id: file.id,
            name: file.file_name,
            source: 'CSV',
            size: formatFileSize(sizeBytes),
            sizeBytes,
            uploadedAt: file.created_at,
            status: file.status,
            rowCount: file.row_count,
            metadata: {
              storagePath: file.storage_path
            }
          })
        }
      }
    } catch (error) {
      console.error('Error processing CSV files:', error)
    }

    // Check if user has Google integration and fetch sheets
    const integration = await getGoogleIntegration(user.id)
    let googleConnected = false
    let googleEmail = null

    if (integration) {
      googleConnected = true
      googleEmail = integration.email || null

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

          // If no sheets in database but user has integration, try to fetch directly from Google and insert
          if (!existingSheets || existingSheets.length === 0) {
            console.log('No Google Sheets in database, attempting server-side fetch from Google Drive...')
            try {
              const googleSheets = await listGoogleSheets(user.id)
              if (googleSheets && googleSheets.length > 0) {
                for (const sheet of googleSheets) {
                  try {
                    await supabaseAdmin.from('google_sheets').insert({
                      google_sheet_id: sheet.id,
                      name: sheet.name,
                      organization_id: organizationId,
                      created_by: user.id,
                      web_view_link: sheet.webViewLink,
                      last_modified: sheet.modifiedTime ? new Date(sheet.modifiedTime).toISOString() : null,
                      created_at: sheet.createdTime ? new Date(sheet.createdTime).toISOString() : new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    })
                  } catch (insertErr) {
                    // ignore insert errors for individual sheets but log
                    console.error('Failed to insert sheet:', sheet.id, insertErr)
                  }
                }

                // Re-fetch inserted sheets
                const { data: syncedSheets } = await supabaseAdmin
                  .from('google_sheets')
                  .select('*')
                  .eq('organization_id', organizationId)
                  .order('updated_at', { ascending: false })

                if (syncedSheets) {
                  const sheetsDataSources = syncedSheets.map((sheet: any) => ({
                    id: sheet.google_sheet_id,
                    name: sheet.name,
                    source: 'Google Sheets' as const,
                    size: 'Cloud',
                    sizeBytes: 0,
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
              console.error('Server-side fetch of Google Sheets failed:', syncError)
            }
          } else {
            // Transform existing Google Sheets to unified format
            const sheetsDataSources = existingSheets.map((sheet: any) => ({
              id: sheet.google_sheet_id,
              name: sheet.name,
              source: 'Google Sheets' as const,
              size: 'Cloud',
              sizeBytes: 0,
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

    return NextResponse.json({
      dataSources: allDataSources,
      storage: {
        used: totalStorageUsed,
        limit: storageLimit,
        percentage: Math.round((totalStorageUsed / storageLimit) * 100)
      },
      googleConnected,
      googleEmail
    })
  } catch (error) {
    console.error('Data sources API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    )
  }
}
