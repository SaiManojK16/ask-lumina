import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { email } = await request.json();
    console.log('Checking existence for email:', email);

    // Try to sign in with password - this will tell us if the user exists
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-password-for-check'
    });

    // If we get an invalid credentials error, the user exists
    // If we get a user not found error, the user doesn't exist
    const exists = error?.message?.includes('Invalid login credentials');
    console.log('User exists:', exists, 'Error:', error?.message);

    return Response.json({ exists });
  } catch (error) {
    console.error('Error in check-user-exists:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
