// /app/api/signup/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const { email, password, firstName, lastName } = await request.json();

  // Basic validation
  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email for simplicity, you might want a confirmation flow
  });

  if (authError) {
    console.error('Error creating user:', authError.message);
    // Provide a more user-friendly error message
    const friendlyMessage = authError.message.includes('unique constraint') 
      ? 'A user with this email already exists.'
      : 'Could not create user. Please try again.';
    return NextResponse.json({ message: friendlyMessage }, { status: 400 });
  }

  if (!authData.user) {
    return NextResponse.json({ message: 'User could not be created.' }, { status: 500 });
  }
  
  const user = authData.user;

  // Insert the profile into the public.profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      email: user.email,
    });

  if (profileError) {
    console.error('Error inserting profile:', profileError.message);
    // In a real-world scenario, you might want to handle this more gracefully,
    // like deleting the created auth user if the profile insertion fails.
    return NextResponse.json({ message: 'Could not save user profile.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 });
}
