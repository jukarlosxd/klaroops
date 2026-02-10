import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs';
import { getUserByEmail, getAmbassadorByUserId, getClientByUserId } from "@/lib/admin-db";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
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

        // 1. Check Super Admin
        const adminEmail = (process.env.ADMIN_EMAIL || 'jukarlosxd@gmail.com').toLowerCase();
        
        if (inputEmail === adminEmail || inputEmail === 'system@klaroops.com') {
           // Admin Access
           // Prefer Environment Variable Hash for production security
           const envHash = process.env.ADMIN_PASSWORD_HASH;
           
           if (envHash) {
               const isValid = await bcrypt.compare(credentials.password, envHash);
               if (isValid) return { id: "admin_1", name: "Admin System", email: inputEmail, role: 'admin' };
           }

           // Fallback for Development ONLY (To be removed in strict production)
           // If no env hash is set, check against hardcoded dev password or DB
           if (process.env.NODE_ENV !== 'production' && credentials.password === '123456') {
               return { id: "admin_1", name: "Dev Admin", email: inputEmail, role: 'admin' };
           }
           
           // SPECIFIC USER BYPASS (Requested by user)
           // Allow legacy admin credentials if env vars fail
           if (inputEmail === 'jukarlosxd@gmail.com' && credentials.password === 'Juan2021%') {
              return { id: "admin_master", name: "Master Admin", email: inputEmail, role: 'admin' };
           }

           // DB Fallback for System User
           const user = await getUserByEmail(inputEmail);
           if (user && await bcrypt.compare(credentials.password, user.password_hash)) {
               return { id: user.id, name: "System Admin", email: user.email, role: 'admin' };
           }
           
           return null;
        }
        
        // 2. Check Database Users (Ambassadors/Clients)
        const user = await getUserByEmail(inputEmail);
        if (user) {
            console.log(`[AUTH] User found in DB: ${user.id} (Role: ${user.role})`);
            const isValid = await bcrypt.compare(credentials.password, user.password_hash);
            if (!isValid) return null;

            // Get profile name
            let name = "User";
            if (user.role === 'ambassador') {
                const amb = await getAmbassadorByUserId(user.id);
                if (amb) name = amb.name;
            } else if (user.role === 'client_user') {
                const client = await getClientByUserId(user.id);
                if (client) name = client.name;
                else name = 'Client User';
            }

            return { 
                id: user.id, 
                name: name, 
                email: user.email, 
                role: user.role 
            };
        }
        
        return null;
      }
    })
  ],
  pages: {
    signIn: '/?view=login',
    error: '/?view=login&error=InvalidCredentials', 
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role || 'user';
        token.id = user.id;
      }
      if (account?.provider === 'google') {
          const dbUser = await getUserByEmail(token.email!);
          if (dbUser) {
              token.role = dbUser.role;
              token.id = dbUser.id;
          } else {
              token.role = 'ambassador'; 
          }
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  // @ts-ignore
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
};
