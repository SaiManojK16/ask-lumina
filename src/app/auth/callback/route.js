import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const COOKIE_OPTIONS = {
  path: '/',
  secure: true,
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7 // 1 week
};

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (!code) {
      throw new Error('No code provided');
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange the code for a session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    if (sessionError || !session) {
      throw sessionError || new Error('No session established');
    }

    // Get user details
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw userError || new Error('No user found');
    }

    // Update Google user metadata if needed
    if (user.app_metadata?.provider === 'google' && !user.user_metadata?.avatar_url) {
      const { identity_data } = user.identities?.[0] || {};
      if (identity_data) {
        await supabase.auth.updateUser({
          data: {
            avatar_url: identity_data.avatar_url,
            full_name: identity_data.full_name,
          }
        });
      }
    }

    // Create response with redirect
    const response = NextResponse.redirect(new URL('/', requestUrl.origin));

    // Set auth cookies
    response.cookies.set('sb-access-token', session.access_token, COOKIE_OPTIONS);
    response.cookies.set('sb-refresh-token', session.refresh_token, COOKIE_OPTIONS);

    // Store user profile data in a non-httpOnly cookie for UI
    response.cookies.set('user-profile', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      avatar_url: user.user_metadata?.avatar_url,
    }), { ...COOKIE_OPTIONS, httpOnly: false });

    // Set session in Supabase client
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });

    return response;
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(
      new URL(`/auth/signin?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
