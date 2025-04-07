import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const path = req.nextUrl.pathname;

    // Allow access to auth pages, API routes, and static files
    if (path.startsWith('/auth/') || path.startsWith('/_next/') || path.startsWith('/api/') || path === '/favicon.ico') {
      // If user is logged in and tries to access auth pages, redirect to home
      if (session && path.startsWith('/auth/')) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      return res;
    }

    // Require auth for all other paths (including root '/')
    if (!session) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
