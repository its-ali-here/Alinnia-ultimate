// In app/api/signup/route.ts

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server" // Use the admin client for elevated privileges

export async function POST(req: Request) {
  const body = await req.json()
  const { email, password, fullName, orgType, orgName, orgId } = body

  // --- 1. Validate Input ---
  if (!email || !password || !fullName || !orgType) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
  }
  if (orgType === "new" && !orgName) {
    return NextResponse.json({ error: "Organization name is required to create a new organization." }, { status: 400 })
  }
  if (orgType === "existing" && !orgId) {
    return NextResponse.json(
      { error: "Organization ID is required to join an existing organization." },
      { status: 400 },
    )
  }

  // --- 2. Create the Auth User ---
  const {
    data: { user },
    error: signUpError,
  } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // You can set this to false for testing if you want
    user_metadata: { full_name: fullName },
  })

  if (signUpError) {
    console.error("Supabase sign up error:", signUpError)
    return NextResponse.json({ error: signUpError.message }, { status: 500 })
  }
  if (!user) {
    return NextResponse.json({ error: "User creation failed." }, { status: 500 })
  }

  // --- 3. Create the Public Profile ---
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({ id: user.id, full_name: fullName, email: email })

  if (profileError) {
    console.error("Profile creation error:", profileError)
    // In a real app, you might want to delete the auth user here if profile creation fails
    return NextResponse.json({ error: "Failed to create user profile." }, { status: 500 })
  }

  // --- 4. Handle Organization ---
  let finalOrgId = orgId
  let organizationData = null

  if (orgType === "new") {
    const { data: newOrg, error: orgCreationError } = await supabaseAdmin
      .from("organizations")
      .insert({ name: orgName, owner_id: user.id })
      .select()
      .single()

    if (orgCreationError) {
      console.error("Organization creation error:", orgCreationError)
      return NextResponse.json({ error: "Failed to create organization." }, { status: 500 })
    }
    finalOrgId = newOrg.id
    organizationData = newOrg
  } else {
    // orgType === 'existing'
    // Verify organization exists
    const { data: existingOrg, error: fetchOrgError } = await supabaseAdmin
      .from("organizations")
      .select("id, name")
      .eq("id", orgId)
      .single()

    if (fetchOrgError || !existingOrg) {
      console.error("Error fetching existing organization:", fetchOrgError)
      return NextResponse.json({ error: "Organization not found or inaccessible." }, { status: 404 })
    }
    finalOrgId = existingOrg.id
    organizationData = existingOrg
  }

  // --- 5. Link User to Organization ---
  const { error: memberError } = await supabaseAdmin.from("organization_members").insert({
    organization_id: finalOrgId,
    user_id: user.id,
    role: orgType === "new" ? "owner" : "member",
  })

  if (memberError) {
    console.error("Organization membership error:", memberError)
    return NextResponse.json({ error: "Failed to add user to organization." }, { status: 500 })
  }

  // --- 6. Update User Profile with Organization ID ---
  // (removed) We no longer attempt to write organization_id into profiles

  return NextResponse.json(
    {
      message: "Signup successful! Please check your email to verify your account.",
      organizationId: finalOrgId, // Return the organization ID
      organizationName: organizationData?.name,
    },
    { status: 200 },
  )
}
