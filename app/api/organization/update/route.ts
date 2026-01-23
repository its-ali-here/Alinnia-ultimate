import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createSupabaseAdminClient()
    const { organizationId, businessType, businessDescription, onboarding_completed } = await req.json()

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required." }, { status: 400 })
    }

    console.log("🔄 Updating organization with business profile:", {
      organizationId,
      businessType,
      businessDescription,
      onboarding_completed
    })

    // Update the organization with business profile data
    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .update({
        business_type: businessType,
        business_description: businessDescription,
        onboarding_completed: onboarding_completed || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)
      .select()
      .single()

    if (orgError) {
      console.error("❌ Error updating organization:", orgError)
      return NextResponse.json({
        error: `Failed to update organization: ${orgError.message}`,
        details: orgError
      }, { status: 500 })
    }

    console.log("✅ Organization updated successfully:", org)

    return NextResponse.json({
      message: "Organization updated successfully!",
      data: org
    })
  } catch (error) {
    console.error("Update organization error:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
