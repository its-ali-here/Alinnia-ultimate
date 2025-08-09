import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createSupabaseAdminClient()
    const { userId, orgCode, designation } = await req.json()

    if (!userId || !orgCode) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    // First, ensure the user has a profile
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (!existingProfile) {
      // Get user info from auth to create profile
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)

      if (authError || !authUser.user) {
        return NextResponse.json({ error: "User not found." }, { status: 404 })
      }

      // Create profile for the user (without designation)
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || "User",
          email: authUser.user.email || "",
        })

      if (profileError) {
        console.error("Error creating profile:", profileError)
        return NextResponse.json({
          error: `Failed to create user profile: ${profileError.message}`
        }, { status: 500 })
      }
    }

    // Find the organization by code
    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id, name")
      .eq("organization_code", orgCode.toUpperCase())
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found. Please check the code and try again." }, { status: 404 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from("organization_members")
      .select("id")
      .eq("organization_id", org.id)
      .eq("user_id", userId)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: "You are already a member of this organization." }, { status: 400 })
    }

    // Add user to organization with designation
    const { error: memberError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        organization_id: org.id,
        user_id: userId,
        role: "member",
        designation: designation || "",
      })

    if (memberError) {
      console.error("Error adding user to organization:", memberError)
      return NextResponse.json({ error: "Failed to join organization." }, { status: 500 })
    }



    return NextResponse.json({
      message: "Successfully joined organization!",
      organizationId: org.id,
      organizationName: org.name,
    })
  } catch (error) {
    console.error("Join organization error:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
