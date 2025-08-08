import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()

    // Parse request body
    const { userId, designation } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!designation || !designation.trim()) {
      return NextResponse.json(
        { error: 'Designation is required' },
        { status: 400 }
      )
    }

    // Update user's designation in organization_members table
    const { data, error } = await supabase
      .from('organization_members')
      .update({ designation: designation.trim() })
      .eq('user_id', userId)
      .select()

    if (error) {
      console.error('Error updating designation:', error)
      return NextResponse.json(
        { error: 'Failed to update designation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Designation updated successfully',
      data
    })

  } catch (error) {
    console.error('Update designation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
