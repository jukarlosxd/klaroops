import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import { getUserByEmail, getAmbassadorByUserId, getClientByUserId } from "@/lib/admin-db";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const inputEmail = credentials?.email?.trim().toLowerCase();
        if (!inputEmail || !credentials?.password) return null;

        console.log(`[AUTH] Attempting login for: ${inputEmail}`);

        // 1. Check Super Admin (Hardcoded/Env fallback)
        const adminEmail = (process.env.ADMIN_EMAIL || 'jukarlosxd@gmail.com').toLowerCase();
        if (inputEmail === adminEmail) {
           const adminHash = process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD_HASH.length > 10 
            ? process.env.ADMIN_PASSWORD_HASH 
            : '$2b$10$ZsSozWoYzLc1oylx9RRFaO8XeI9oX6Uy2uez1cVTOyvRqKt2uxRm.'; // Juan2021%

           const isValid = await bcrypt.compare(credentials.password, adminHash);
           
           if (!isValid) {
             console.log("[AUTH] Invalid password for admin");
             return null;
           }
           console.log("[AUTH] Admin login successful");
           return { id: "admin_1", name: "Admin System", email: adminEmail, role: 'admin' };
        }
        
        // 2. Check Database Users (Ambassadors)
        const user = await getUserByEmail(inputEmail);
        if (user) {
            console.log(`[AUTH] User found in DB: ${user.id} (Role: ${user.role})`);
            const isValid = await bcrypt.compare(credentials.password, user.password_hash);
            if (!isValid) {
                console.log("[AUTH] Invalid password for DB user");
                return null;
            }

            // Get profile name if available
            let name = "User";
            if (user.role === 'ambassador') {
                const amb = await getAmbassadorByUserId(user.id);
                if (amb) name = amb.name;
            } else if (user.role === 'client_user') {
                const client = await getClientByUserId(user.id);
                if (client) name = client.name;
                else name = 'Client User';
            }

            console.log(`[AUTH] Login successful for ${name}`);
            return { 
                id: user.id, 
                name: name, 
                email: user.email, 
                role: user.role 
            };
        }
        
        console.log("[AUTH] User not found");
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login?error=InvalidCredentials', 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_demo_only_12345",
  debug: process.env.NODE_ENV === 'development',
  // @ts-ignore
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
};
