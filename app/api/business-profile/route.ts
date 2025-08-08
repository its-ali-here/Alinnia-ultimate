import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()

    // Parse request body first
    const body = await request.json()
    const { userId, designation, businessType, businessDescription, businessMetrics, keyOperations, painPoints, goals, csvFilePath } = body

    // For now, we'll get the user ID from the request body
    // In a production app, you'd want to verify the user's session
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get user's organization
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
      .single()

    if (!orgMember) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 400 }
      )
    }



    // Validate required fields
    if (!businessType || !businessDescription) {
      return NextResponse.json(
        { error: 'Business type and description are required' },
        { status: 400 }
      )
    }

    // Set default operations, pain points, and goals based on business type
    const businessTypeDefaults: Record<string, any> = {
      restaurant: {
        operations: ["Dine-in", "Takeout"],
        painPoints: ["Food cost tracking", "Table turnover"],
        goals: ["Reduce food costs", "Increase table turnover"]
      },
      auto_shop: {
        operations: ["Oil Changes", "Brake Service", "Engine Repair"],
        painPoints: ["Bay utilization", "Parts inventory"],
        goals: ["Increase bay occupancy", "Improve mechanic efficiency"]
      },
      retail: {
        operations: ["In-store Sales", "Inventory Management"],
        painPoints: ["Inventory tracking", "Sales forecasting"],
        goals: ["Increase sales conversion", "Optimize inventory levels"]
      }
    }

    const defaults = businessTypeDefaults[businessType] || {}
    const finalKeyOperations = keyOperations && keyOperations.length > 0 ? keyOperations : defaults.operations || []
    const finalPainPoints = painPoints && painPoints.length > 0 ? painPoints : defaults.painPoints || []
    const finalGoals = goals && goals.length > 0 ? goals : defaults.goals || []

    // Check if business profile already exists
    const { data: existingProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('organization_id', orgMember.organization_id)
      .single()

    let result

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('business_profiles')
        .update({
          business_type: businessType,
          business_description: businessDescription,
          business_metrics: businessMetrics || {},
          key_operations: finalKeyOperations,
          pain_points: finalPainPoints,
          goals: finalGoals,
          onboarding_csv_path: csvFilePath,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', orgMember.organization_id)
        .select()
        .single()

      if (error) {
        console.error('Error updating business profile:', error)
        return NextResponse.json(
          { error: 'Failed to update business profile' },
          { status: 500 }
        )
      }

      result = data
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('business_profiles')
        .insert({
          organization_id: orgMember.organization_id,
          business_type: businessType,
          business_description: businessDescription,
          business_metrics: businessMetrics || {},
          key_operations: finalKeyOperations,
          pain_points: finalPainPoints,
          goals: finalGoals,
          onboarding_csv_path: csvFilePath,
          onboarding_completed: true
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating business profile:', error)
        return NextResponse.json(
          { error: 'Failed to create business profile' },
          { status: 500 }
        )
      }

      result = data
    }

    // TODO: Trigger AI blueprint generation here
    // This could be done asynchronously or as a separate API call

    return NextResponse.json({
      success: true,
      message: 'Business profile saved successfully',
      data: result
    })

  } catch (error) {
    console.error('Business profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()

    // For now, we'll need to get the user ID from query params or headers
    // In a production app, you'd verify the user's session
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get user's organization
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
      .single()

    if (!orgMember) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 400 }
      )
    }

    // Get business profile
    const { data: profile, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('organization_id', orgMember.organization_id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching business profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch business profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile || null
    })

  } catch (error) {
    console.error('Business profile GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
