import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Get all users with their roles
export async function GET(req) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify admin access
    const { data: { session } } = await supabase.auth.getSession();
    const isAdmin = session?.user?.user_metadata?.userRole === 'admin' || session?.user?.user_metadata?.is_super_admin === true;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create admin client
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: { users }, error } = await adminClient.auth.admin.listUsers();
    if (error) throw error;

    // Format user data
    const formattedUsers = (users || []).map(user => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      role: user.user_metadata?.userRole || 'user',
      user_metadata: user.user_metadata,
      lastSignIn: user.last_sign_in_at,
      createdAt: user.created_at
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update user role
export async function PUT(req) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify admin access
    const { data: { session } } = await supabase.auth.getSession();
    const isAdmin = session?.user?.user_metadata?.userRole === 'admin' || session?.user?.user_metadata?.is_super_admin === true;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role } = await req.json();

    // Create admin client
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Update user metadata
    const metadata = { userRole: role };

    // If making or removing super admin status
    if (req.headers['x-make-super-admin'] === 'true') {
      metadata.is_super_admin = true;
    } else if (req.headers['x-remove-super-admin'] === 'true') {
      metadata.is_super_admin = false;
    }

    const { data, error } = await adminClient.auth.admin.updateUserById(
      userId,
      { user_metadata: metadata }
    );

    if (error) throw error;

    return NextResponse.json({ 
      message: 'User role updated successfully',
      user: data.user 
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
