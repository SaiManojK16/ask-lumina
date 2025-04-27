import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('Current session:', session);

    // Update user's metadata to make them admin and super admin
    const { data: userData, error: userError } = await supabase.auth.updateUser({
      data: { 
        userRole: 'admin',
        is_super_admin: true
      }
    });
    if (userError) throw userError;

    console.log('Update result:', userData);

    console.log('Update result:', { userData });

    return NextResponse.json({ 
      message: 'Successfully set up super admin user',
      user: userData.user 
    });

  } catch (error) {
    console.error('Error setting up admin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
