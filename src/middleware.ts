import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/signup") || req.nextUrl.pathname === "/";

    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow public access to /demo, /signup, /api/auth, and root /
        if (
          req.nextUrl.pathname.startsWith("/demo") ||
          req.nextUrl.pathname.startsWith("/signup") ||
          req.nextUrl.pathname.startsWith("/api/auth") ||
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname.startsWith("/_next") ||
          req.nextUrl.pathname.startsWith("/static")
        ) {
          return true;
        }
        // Require token for /dashboard and other protected routes
        return !!token;
      },
    },
    // CRITICAL FIX: Explicitly pass the secret to middleware
    // This allows it to work on Vercel even if NEXTAUTH_SECRET env var is missing
    secret: process.env.NEXTAUTH_SECRET || 'emergency-fallback-secret-production-fix-2024',
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/demo/:path*", "/signup/:path*", "/"],
};
