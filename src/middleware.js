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
    const isPublicPage = isAuthPage || req.nextUrl.pathname === '/api/auth';

    // If we have a session and user is on auth page, redirect to home
    if (session && isAuthPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // If we don't have a session and user is not on a public page, redirect to signin
    if (!session && !isPublicPage) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to signin to be safe
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  return res;
}

// Configure which routes to protect with authentication
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth & Supabase auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)'
  ],
};

// Apply NextAuth middleware
export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
});
