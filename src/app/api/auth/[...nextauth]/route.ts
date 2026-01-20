import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
        if (credentials?.password === adminPassword) {
          return { id: "1", name: "Admin User", email: "admin@klaroops.internal" };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login', // Redirect back to login on error
  },
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_demo_only_12345",
  debug: true,
  // @ts-ignore - trustHost is valid in v4 but might be missing in type definition depending on version
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  // SIMPLIFIED COOKIE CONFIG: Remove secure override to rely on NextAuth default behavior
  // NextAuth automatically detects https in Vercel. Forcing secure: true might cause issues if detection fails or in dev.
  // Forcing secure: false breaks in modern browsers on https.
  // Best to let NextAuth handle it, but keep sameSite lax for redirect flows.
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
