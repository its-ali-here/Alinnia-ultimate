import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const supabase = createSupabaseAdminClient();
  const body = await req.json();

  const {
    email,
    password,
    firstName,
    lastName,
    companyName,
    city,
    country,
    industry,
    plan,
  } = body;

  // --- 1. Create the user ---
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm user for simplicity
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
    },
  });

  if (authError || !authData?.user) {
    console.error('Error creating user:', authError);
    // User might already exist, provide a generic but helpful error
    if (authError?.message.includes('already registered')) {
        return NextResponse.json({ error: 'A user with this email is already registered.' }, { status: 409 });
    }
    return NextResponse.json({ error: authError?.message || 'Failed to create user.' }, { status: 500 });
  }

  const userId = authData.user.id;

  // --- 2. Create the organization ---
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: companyName,
      owner_id: userId,
      email: email,
      city: city,
      country: country,
      industry: industry,
      plan: plan,
    })
    .select()
    .single();

  if (orgError || !orgData) {
    console.error('Error creating organization:', orgError);
    // If organization fails, attempt to clean up the created user
    await supabase.auth.admin.deleteUser(userId);
    console.log(`Cleaned up user ${userId} after failed organization creation.`);
    return NextResponse.json({ error: orgError?.message || 'Failed to create organization.' }, { status: 500 });
  }

  // --- Success ---
  return NextResponse.json({
    message: 'User and organization created successfully.',
    user: authData.user,
    organization: orgData,
  });
}
