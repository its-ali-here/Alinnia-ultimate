import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    console.log('Google Sheets import endpoint called')
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { googleSheetId, name, webViewLink, lastModified, organizationId, userId } = body

    console.log('Import request:', {
      googleSheetId,
      name,
      organizationId,
      userId
    })

    if (!googleSheetId || !name || !organizationId || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: googleSheetId, name, organizationId, userId' 
      }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    // Check if sheet already exists for this organization
    const { data: existingSheet } = await supabase
      .from('google_sheets')
      .select('id')
      .eq('google_sheet_id', googleSheetId)
      .eq('organization_id', organizationId)
      .single()

    if (existingSheet) {
      console.log('Sheet already exists:', googleSheetId)
      return NextResponse.json({ 
        message: 'Sheet already imported',
        alreadyExists: true 
      })
    }

    // Insert the new Google Sheet
    const { data: newSheet, error: insertError } = await supabase
      .from('google_sheets')
      .insert({
        google_sheet_id: googleSheetId,
        name,
        organization_id: organizationId,
        created_by: userId,
        web_view_link: webViewLink,
        last_modified: lastModified ? new Date(lastModified).toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting Google Sheet:', insertError)
      return NextResponse.json({ 
        error: 'Failed to import Google Sheet',
        details: insertError.message 
      }, { status: 500 })
    }

    console.log('Google Sheet imported successfully:', newSheet.id)
    return NextResponse.json({ 
      success: true,
      sheet: newSheet,
      message: 'Google Sheet imported successfully'
    })

  } catch (error) {
    console.error('Google Sheets import error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to import Google Sheet',
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}
