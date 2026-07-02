"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// A single client instance for the app. Guard against a missing URL so the app
// renders a helpful message instead of crashing during initial setup.
const convex = convexUrl
  ? new ConvexReactClient(convexUrl)
  : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-lg font-semibold text-foreground">
            Convex is not configured
          </h1>
          <p className="text-sm text-muted-foreground">
            Set <code className="rounded bg-muted px-1">NEXT_PUBLIC_CONVEX_URL</code>{" "}
            in your <code className="rounded bg-muted px-1">.env.local</code> and
            run <code className="rounded bg-muted px-1">npx convex dev</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
