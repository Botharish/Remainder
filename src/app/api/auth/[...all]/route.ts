import { nextJsHandler } from "@convex-dev/better-auth/nextjs";

/**
 * Proxies Better Auth requests from the browser (same-origin `/api/auth/*`) to
 * the Better Auth server running inside Convex. Keeping this same-origin means
 * session cookies work without cross-domain configuration.
 */
export const { GET, POST } = nextJsHandler({
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
});
