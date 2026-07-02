import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic route protection. This only checks for the *presence* of a Better
 * Auth session cookie — the authoritative role/approval check happens in Convex
 * (see `requireApprovedUser`) and in the client `AuthGuard`. Keeping this cheap
 * avoids a round-trip on every navigation while still bouncing anonymous users
 * away from the app shell.
 */
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protect the authenticated app sections only.
  matcher: ["/dashboard/:path*", "/projects/:path*", "/logs/:path*", "/settings/:path*", "/admin/:path*"],
};
