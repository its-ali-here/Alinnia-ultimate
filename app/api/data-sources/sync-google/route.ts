import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { listGoogleSheets } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { organizationId, userId } = await request.json()
    if (!organizationId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseAdmin = createSupabaseAdminClient()
    const googleSheets = await listGoogleSheets(userId)

    const { data: existingSheets } = await supabaseAdmin
      .from('google_sheets')
      .select('google_sheet_id')
      .eq('organization_id', organizationId)

    const existingIds = new Set(existingSheets?.map(s => s.google_sheet_id) || [])
    let created = 0, updated = 0

    for (const sheet of googleSheets) {
      const sheetData = {
        google_sheet_id: sheet.id,
        name: sheet.name,
        organization_id: organizationId,
        created_by: userId,
        web_view_link: sheet.webViewLink,
        last_modified: sheet.modifiedTime ? new Date(sheet.modifiedTime).toISOString() : null,
        updated_at: new Date().toISOString()
      }

      if (existingIds.has(sheet.id)) {
        await supabaseAdmin
          .from('google_sheets')
          .update(sheetData)
          .eq('google_sheet_id', sheet.id)
          .eq('organization_id', organizationId)
        updated++
      } else {
        await supabaseAdmin.from('google_sheets').insert(sheetData)
        created++
      }
    }

    return NextResponse.json({ success: true, created, updated, total: googleSheets.length })
  } catch (error) {
    console.error('Sync Google Sheets error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
