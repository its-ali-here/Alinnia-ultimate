import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const body = await req.json();
    const { email, password, fullName } = body;

    // --- 1. Validate Input ---
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    // --- 2. Create the Auth User ---
    const { data: { user }, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification for testing phase
      user_metadata: { full_name: fullName },
    });

    if (signUpError) {
      console.error("Auth signup error:", signUpError);
      throw new Error(signUpError.message);
    }
    
    if (!user) {
      throw new Error("User creation failed.");
    }

    // --- 3. Create the Public Profile ---
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: user.id,
        full_name: fullName,
        email: email
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw new Error("Failed to create user profile.");
    }

    // --- 4. Success ---
    return NextResponse.json({
      message: "Signup successful! You can now log in to your account.",
      userId: user.id,
    }, { status: 200 });

  } catch (error) {
    console.error("Signup API Error:", (error as Error).message);
    return NextResponse.json({ 
      error: (error as Error).message || "An unexpected error occurred during signup." 
    }, { status: 500 });
  }
}
