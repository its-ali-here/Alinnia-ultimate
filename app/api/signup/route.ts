import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server"; // <-- THIS IS THE FIX

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
    const supabaseAdmin = createSupabaseAdminClient();
    const body = await req.json();
    const { 
      email, password, fullName, designation, orgType, 
      orgName, orgCode, orgEmail, orgIndustry, orgCity, orgCountry 
    } = body;

    // --- 1. Validate Input ---
    if (!email || !password || !fullName || !orgType) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // --- 2. Create the Auth User ---
    const { data: { user }, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (signUpError) throw new Error(signUpError.message);
    if (!user) throw new Error("User creation failed.");

    // --- 3. Create the Public Profile ---
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({ id: user.id, full_name: fullName, email: email, designation: designation });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw new Error("Failed to create user profile.");
    }

    // --- 4. Handle Organization ---
    let organization;
    if (orgType === "new") {
      if (!orgName || !orgEmail || !orgIndustry || !orgCity || !orgCountry) {
        return NextResponse.json({ error: "All organization detail fields are required." }, { status: 400 });
      }
      const newOrgCode = await generateUniqueOrgCode();
      
      const { data: newOrg, error: orgCreationError } = await supabaseAdmin
        .from("organizations")
        .insert({
          name: orgName,
          owner_id: user.id,
          organization_code: newOrgCode,
          email: orgEmail,
          industry: orgIndustry,
          city: orgCity,
          country: orgCountry,
        })
        .select()
        .single();
      
      if (orgCreationError) throw new Error(orgCreationError.message);
      organization = newOrg;

    } else { // orgType === 'existing'
      if (!orgCode) return NextResponse.json({ error: "Organization code is required." }, { status: 400 });

      const { data: existingOrg, error: fetchOrgError } = await supabaseAdmin
        .from("organizations")
        .select("id, name")
        .eq("organization_code", orgCode.toUpperCase())
        .single();

      if (fetchOrgError || !existingOrg) throw new Error("Organization with that code not found.");
      organization = existingOrg;
    }
    
    // --- 5. Link User to Organization ---
    const { error: memberError } = await supabaseAdmin.from("organization_members").insert({
      organization_id: organization.id,
      user_id: user.id,
      role: orgType === "new" ? "owner" : "member",
    });
    if (memberError) throw new Error("Failed to add user to organization.");

    // --- 6. Success ---
    return NextResponse.json({
      message: "Signup successful!",
      organizationId: organization.id,
      organizationName: organization.name,
    }, { status: 200 });

  } catch (error) {
    console.error("Signup API Error:", (error as Error).message);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}