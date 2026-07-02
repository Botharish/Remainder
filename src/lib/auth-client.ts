import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

/**
 * Better Auth browser client. Requests hit the same-origin `/api/auth/*` route,
 * which proxies to the Better Auth server running inside Convex. The
 * `convexClient` plugin exchanges the session for a Convex token so authed
 * Convex queries/mutations run as the signed-in user.
 */
export const authClient = createAuthClient({
  plugins: [convexClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
