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
    email_confirm: true,
    // Add user metadata that can trigger a database function
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
    }
  });

  if (authError) {
    console.error('Auth Error:', authError);
    return NextResponse.json({ 
      message: 'Failed to create user account', 
      error: authError.message 
    }, { status: 400 });
  }

  if (!authData.user) {
    return NextResponse.json({ message: 'User could not be created.' }, { status: 500 });
  }
  
  const user = authData.user;

  try {
    // Insert the profile into the public.profiles table - remove created_at/updated_at to let DB handle them
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        email: user.email,
      });

    if (profileError) {
      console.error('Profile Error Details:', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code
      });
      
      // Try to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(user.id);
      
      return NextResponse.json({ 
        message: 'Could not create user profile', 
        error: profileError.message,
        code: profileError.code,
        details: profileError.details 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'User created successfully', 
      userId: user.id 
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    // Clean up auth user on any error
    await supabase.auth.admin.deleteUser(user.id);
    
    return NextResponse.json({ 
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}