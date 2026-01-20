import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // We only need to check auth, we don't need complex path checking here
  // because the config.matcher handles what paths this middleware runs on.
  
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_demo_only_12345" 
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // STRICT MATCHER: Only run middleware on these specific paths
  // This completely avoids running middleware on /api/*, /_next/*, /static/*, etc.
  matcher: [
    "/",
    "/clients/:path*"
  ],
};
