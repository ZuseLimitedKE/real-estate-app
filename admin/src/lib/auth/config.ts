import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthConfig } from 'next-auth';

// Secure admin authentication configuration
export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Get admin credentials from environment
          const adminEmail = process.env.ADMIN_EMAIL;
          const adminPassword = process.env.ADMIN_PASSWORD;

          if (!adminEmail || !adminPassword) {
            console.error('Admin credentials not configured');
            return null;
          }

          // Verify credentials
          if (credentials.email === adminEmail && credentials.password === adminPassword) {
            // Return admin user object
            return {
              id: 'admin-1',
              email: adminEmail,
              name: 'System Administrator',
              role: 'ADMIN',
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};