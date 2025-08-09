import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-server"

// Helper function to generate a unique organization code with retries
async function generateUniqueOrgCode(maxAttempts = 5): Promise<string> {
  const supabaseAdmin = createSupabaseAdminClient();
  let attempts = 0;
  while (attempts < maxAttempts) {
    attempts++;
    const code = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('')
      .substring(0, 6);

    const { data, error } = await supabaseAdmin
      .from("organizations")
      .select("organization_code")
      .eq("organization_code", code)
      .single();

    if (error && error.code === 'PGRST116') {
      return code;
    }
    if (!error && data) {
      console.warn(`Organization code collision for '${code}'. Retrying...`);
      continue;
    }
    if (error) {
      console.error("Unexpected database error while checking org code:", error);
      throw new Error(`Database error: ${error.message}`);
    }
  }
  throw new Error("Failed to generate a unique organization code after several attempts.");
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createSupabaseAdminClient()
    const { userId, orgName } = await req.json()

    if (!userId || !orgName) {
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

      // Create profile for the user
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

    // Generate unique organization code
    const orgCode = await generateUniqueOrgCode()

    // Create the organization (without owner_id to avoid foreign key constraint)
    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: orgName,
        organization_code: orgCode,
        email: "", // Will be filled during onboarding
        industry: "", // Will be filled during onboarding
        city: "", // Will be filled during onboarding
        country: "", // Will be filled during onboarding
      })
      .select()
      .single()

    if (orgError) {
      console.error("Error creating organization:", orgError)
      return NextResponse.json({ error: "Failed to create organization." }, { status: 500 })
    }

    // Add user to organization as owner
    const { error: memberError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        organization_id: org.id,
        user_id: userId,
        role: "owner",
        designation: "Owner", // Default designation for organization owner
      })

    if (memberError) {
      console.error("Error adding user to organization:", memberError)
      // Clean up the organization if member creation fails
      await supabaseAdmin.from("organizations").delete().eq("id", org.id)
      return NextResponse.json({ error: "Failed to add user to organization." }, { status: 500 })
    }

    return NextResponse.json({
      message: "Organization created successfully!",
      organizationId: org.id,
      organizationName: org.name,
      organizationCode: org.organization_code,
    })
  } catch (error) {
    console.error("Create organization error:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
