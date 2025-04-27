import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Get current user's ID from the request
    const { userId } = await req.json();

    // Update the user's super admin status directly in the auth.users table
    const { data, error } = await supabase
      .from('auth.users')
      .update({ is_super_admin: true })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ 
      message: 'Successfully set up super admin',
      user: data
    });

  } catch (error) {
    console.error('Error setting up super admin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
