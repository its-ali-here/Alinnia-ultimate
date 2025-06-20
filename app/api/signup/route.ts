// In app/api/signup/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// New, corrected helper function for app/api/signup/route.ts
async function generateUniqueOrgCode(maxAttempts = 5): Promise<string> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    attempts++;
    // Generate a random 6-character code
    const code = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('')
      .substring(0, 6);

    // Attempt to find an organization with this code
    const { data, error } = await supabaseAdmin
      .from("organizations")
      .select("organization_code")
      .eq("organization_code", code)
      .single();

    // VITAL CHANGE IS HERE:
    // This is the expected error when no rows are found. It means the code is unique!
    if (error && error.code === 'PGRST116') {
      return code; // This is our SUCCESS case.
    }

    // If there was no error and we got data back, it means the code is a duplicate.
    if (!error && data) {
      console.warn(`Organization code collision for '${code}'. Retrying...`);
      continue; // Continue the loop to try a new code.s
    }

    // If there was any other kind of error, it's an actual problem, and we should stop.
    if (error) {
      console.error("Unexpected database error while checking org code:", error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // If the loop finishes after all attempts, we throw the final error.
  throw new Error("Failed to generate a unique organization code after several attempts.");
}

// Updated POST function in app/api/signup/route.ts

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Destructure all the new fields from the form
    const { 
      email, password, fullName, orgType, 
      orgName, orgCode, orgEmail, orgIndustry, orgCity, orgCountry 
    } = body;

    // --- 1. Validate Input ---
    if (!email || !password || !fullName || !orgType) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // ... (user creation and profile creation logic remains the same) ...
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
      .insert({ id: user.id, full_name: fullName, email: email });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw new Error("Failed to create user profile.");
    }


    // --- 4. Handle Organization ---
    let organization;
    if (orgType === "new") {
      // Validation for new org fields
      if (!orgName || !orgEmail || !orgIndustry || !orgCity || !orgCountry) {
        return NextResponse.json({ error: "All organization detail fields are required." }, { status: 400 });
      }
      
      const newOrgCode = await generateUniqueOrgCode(); // Assumes this helper function exists from previous step
      
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

    } else { // orgType === 'existing' logic remains the same
      if (!orgCode) return NextResponse.json({ error: "Organization code is required." }, { status: 400 });

      const { data: existingOrg, error: fetchOrgError } = await supabaseAdmin
        .from("organizations")
        .select("id, name")
        .eq("organization_code", orgCode.toUpperCase())
        .single();

      if (fetchOrgError || !existingOrg) throw new Error("Organization with that code not found.");
      organization = existingOrg;
    }
    
    // ... (The rest of the function: linking user, returning response) ...
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