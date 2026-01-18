import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createSupabaseAdminClient()
    const { userId, orgCode, designation } = await req.json()

    // Validate input
    if (!userId || !orgCode) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    if (orgCode.length !== 6) {
      return NextResponse.json({ error: "Organization code must be 6 characters." }, { status: 400 })
    }

    // Find organization by code
    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id, name")
      .eq("organization_code", orgCode.toUpperCase())
      .single()

    if (orgError || !organization) {
      return NextResponse.json({ error: "Organization not found." }, { status: 404 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from("organization_members")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    if (existingMember) {
      return NextResponse.json({ error: "You are already a member of an organization." }, { status: 409 })
    }

    // Add user to organization
    const { error: memberError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        organization_id: organization.id,
        user_id: userId,
        role: "member",
        designation: designation || "Member",
      })

    if (memberError) {
      console.error("Error adding member:", memberError)
      if (memberError.code === '23505') {
        return NextResponse.json({ error: "You are already a member of this organization." }, { status: 409 })
      }
      return NextResponse.json({ error: "Failed to join organization." }, { status: 500 })
    }

    return NextResponse.json({
      message: "Successfully joined organization!",
      organizationId: organization.id,
      organizationName: organization.name,
    })

  } catch (error) {
    console.error("Join organization error:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
