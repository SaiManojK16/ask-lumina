import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export async function middleware(req) {
  const res = NextResponse.next();

  // Initialize Supabase client
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Check Supabase session
    const { data: { session } } = await supabase.auth.getSession();

    // Handle auth pages
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    
    // If we have a session and user is on auth page, redirect to home
    if (session && isAuthPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  // Continue with NextAuth middleware
  return res;
}

// Protect these routes with NextAuth
export const config = {
  matcher: [
    '/',
    '/chat/:path*',
    '/dashboard/:path*',
    '/auth/:path*'
  ],
};

// Apply NextAuth middleware
export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
});
