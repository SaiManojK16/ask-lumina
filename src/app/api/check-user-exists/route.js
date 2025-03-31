import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Use the admin API to search for users
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) throw error;

    // Case-insensitive email check
    const exists = data?.users?.some(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );

    return Response.json({ exists });
  } catch (error) {
    console.error('Error checking user existence:', error);
    return Response.json(
      { error: 'Error checking user existence' },
      { status: 500 }
    );
  }
}
