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
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/demo/:path*", "/signup/:path*", "/"],
};
