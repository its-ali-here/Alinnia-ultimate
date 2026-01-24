import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { roles } from "@/lib/roles";

export async function POST(req: Request) {
  const supabaseAdmin = createSupabaseAdminClient();
  const body = await req.json();

  const {
    email,
    password,
    firstName,
    lastName,
    companyName,
    plan,
    paymentConfirmed,
  } = body;

  // --- 1. Validate Input ---
  if (!email || !password || !firstName || !lastName || !companyName || !plan) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
  }
  
  let userId = '';

  try {
    // --- 2. Create the Auth User ---
    const fullName = `${firstName} ${lastName}`;
    const { data: { user }, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm user
      user_metadata: { full_name: fullName },
    });

    if (signUpError) throw signUpError;
    if (!user) throw new Error("User creation failed.");
    userId = user.id; // Assign userId for cleanup if needed

    // --- 3. Create the Public Profile ---
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({ id: user.id, full_name: fullName, email: email });

    if (profileError) throw profileError;

    // --- 4. Create the Organization ---
    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({ name: companyName })
      .select('id')
      .single();

    if (orgError || !org) throw orgError;

    // --- 5. Link User to Organization ---
    const { error: memberError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: roles[0]
      });

    if (memberError) throw memberError;

    // --- 6. Create Subscription Record (Simulated) ---
    // In a real app, this would likely be more complex, involving a Stripe customer ID.
    /*
    const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
            organization_id: org.id,
            plan: plan,
            status: 'active', // or 'trialing'
            // expires_at would be set here
        });

    if (subError) throw subError;
    */

    // --- 7. Success ---
    return NextResponse.json({
      message: "Signup successful! Your organization has been created.",
      userId: user.id,
      organizationId: org.id
    }, { status: 200 });

  } catch (error) {
    // If any step fails, delete the auth user if they were created
    if (userId) {
      console.log(`Cleaning up auth user ${userId} due to error.`);
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }
    
    console.error("Signup API Error:", (error as Error).message);
    return NextResponse.json({ 
      error: (error as Error).message || "An unexpected error occurred during signup." 
    }, { status: 500 });
  }
}
