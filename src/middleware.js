import { withAuth } from "next-auth/middleware";

export const config = {
  matcher: [
    '/',
    '/chat/:path*',
    '/dashboard/:path*',
  ],
};

export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
});
