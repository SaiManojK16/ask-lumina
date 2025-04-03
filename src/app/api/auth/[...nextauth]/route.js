import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        try {
          // First sign in with password
          const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (signInError) throw signInError;
          if (!user) throw new Error('No user found');

          // Then get the user's full profile
          const { data: { user: fullUser }, error: getUserError } = await supabase.auth.getUser();

          if (getUserError) throw getUserError;

          const metadata = fullUser?.user_metadata || {};
          const firstName = metadata.first_name || '';
          const lastName = metadata.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim();
          
          return {
            id: user.id,
            email: user.email,
            name: fullName || 'User',
          };
        } catch (error) {
          throw new Error(error.message);
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account && profile) {
        token.id = profile.sub;
        token.provider = account.provider;
        if (account.provider === 'google') {
          token.name = profile.name;
          token.email = profile.email;
        }
      }
      if (user) {
        // For credentials provider
        token.id = user.id;
        token.email = user.email;
        
        // Get user metadata from Supabase
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
        if (!error && supabaseUser?.user_metadata) {
          const metadata = supabaseUser.user_metadata;
          const firstName = metadata.first_name || '';
          const lastName = metadata.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim();
          token.name = fullName || 'User';
        } else {
          token.name = user.name || 'User';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Create a new user object to avoid any default values
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name || 'User',
          provider: token.provider
        };
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
