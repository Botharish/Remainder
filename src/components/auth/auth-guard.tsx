"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSession } from "@/lib/auth-client";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { AccountStatusScreen } from "@/components/auth/account-status-screen";

/**
 * Gates the authenticated area of the app:
 *  1. No session -> redirect to /login.
 *  2. Profile pending/rejected -> show the status screen.
 *  3. Approved -> render the app.
 *
 * The app profile is created server-side at sign-up (auth.ts `onCreateUser`),
 * so by the time a session exists the profile does too.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const me = useQuery(api.users.me);

  // Redirect out when there is definitively no session.
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace("/login");
    }
  }, [sessionLoading, session, router]);

  if (sessionLoading || me === undefined) {
    return <FullScreenLoader label="Loading your workspace…" />;
  }

  if (!session) {
    return <FullScreenLoader label="Redirecting to sign in…" />;
  }

  // Session exists but the profile briefly hasn't propagated yet.
  if (me === null) {
    return <FullScreenLoader label="Setting up your account…" />;
  }

  if (me.status !== "approved") {
    return <AccountStatusScreen status={me.status} name={me.name} />;
  }

  return <>{children}</>;
}
