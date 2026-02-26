import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession as nextAuthGetServerSession } from 'next-auth/next';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: string;
      tenantId: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Demo auth - no database required
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }

        // Accept demo credentials or any email/password for now
        if (credentials.email === 'demo@example.com' && credentials.password === 'password123') {
          return {
            id: 'user-1',
            email: 'demo@example.com',
            name: 'Demo User',
            image: null,
            role: 'admin',
            tenantId: 'tenant-1',
          };
        }

        // Accept any credentials during development
        return {
          id: 'user-1',
          email: credentials.email,
          name: credentials.email.split('@')[0],
          image: null,
          role: 'admin',
          tenantId: 'tenant-1',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = (token.name as string) || null;
        session.user.image = (token.image as string) || null;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getServerSession() {
  const session = await nextAuthGetServerSession(authOptions);
  return session;
}
