import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { organizationId, source } = await request.json()
    const supabaseAdmin = createSupabaseAdminClient()

    if (source === 'CSV') {
      // Get file path first
      const { data: file } = await supabaseAdmin
        .from('datasources')
        .select('storage_path')
        .eq('id', id)
        .single()

      if (file?.storage_path) {
        await supabaseAdmin.storage.from('files').remove([file.storage_path])
      }
      await supabaseAdmin.from('datasources').delete().eq('id', id)
    } else if (source === 'Google Sheets') {
      await supabaseAdmin
        .from('google_sheets')
        .delete()
        .eq('google_sheet_id', id)
        .eq('organization_id', organizationId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete data source error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
