import {
  BetterAuth,
  convexAdapter,
  type AuthFunctions,
} from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import type {
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import { components, internal } from "./_generated/api";
import type { DataModel, Id } from "./_generated/dataModel";
import { writeLog } from "./model/logs";

/**
 * The public URL of the app. Better Auth uses it to build callback/redirect
 * URLs and validate request origins. Set it on the Convex deployment with:
 *   npx convex env set SITE_URL http://localhost:3000
 */
const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

// Internal mutations (createUser/updateUser/deleteUser/createSession) that the
// component calls to keep our app tables in sync. Defined + exported below.
const authFunctions: AuthFunctions = internal.auth as unknown as AuthFunctions;

/** The Better Auth <-> Convex component instance. */
export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
});

type AuthCtx =
  | GenericQueryCtx<DataModel>
  | GenericMutationCtx<DataModel>
  | GenericActionCtx<DataModel>;

/** Build a Better Auth instance bound to a Convex ctx. */
export const createAuth = (ctx: AuthCtx) =>
  betterAuth({
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database: convexAdapter(ctx, betterAuthComponent),
    // Google is the only sign-in method for this app.
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    // Issues Convex-compatible JWTs so the browser can call Convex as the user.
    plugins: [convex()],
  });

/**
 * Component sync mutations. `onCreateUser` is where a new authenticated
 * identity becomes an application user: we create the profile with the correct
 * role/status. The bootstrap admin (ADMIN_EMAIL) is auto-approved.
 */
export const { createUser, updateUser, deleteUser, createSession } =
  betterAuthComponent.createAuthFunctions<DataModel>({
    onCreateUser: async (ctx, authUser) => {
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
      const isAdmin =
        !!adminEmail && authUser.email.toLowerCase() === adminEmail;

      const userId = await ctx.db.insert("users", {
        name: authUser.name ?? authUser.email,
        email: authUser.email,
        image: authUser.image ?? undefined,
        role: isAdmin ? "admin" : "user",
        status: isAdmin ? "approved" : "pending",
        createdAt: Date.now(),
      });

      await writeLog(
        ctx,
        userId,
        "login",
        isAdmin
          ? "Bootstrap admin account created."
          : "Account created and awaiting approval.",
      );

      // The returned id is stored as the auth user's `userId` and links the two.
      return userId;
    },

    onUpdateUser: async (ctx, authUser) => {
      // Keep the profile's display fields in sync with the auth record.
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", authUser.email))
        .unique();
      if (user) {
        await ctx.db.patch(user._id, {
          name: authUser.name ?? user.name,
          image: authUser.image ?? user.image,
        });
      }
    },

    onDeleteUser: async (ctx, id) => {
      const userId = id as unknown as Id<"users">;
      // Cascade delete the user's app data.
      for (const table of ["projects", "reminders", "logs"] as const) {
        const rows = await ctx.db
          .query(table)
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect();
        await Promise.all(rows.map((r) => ctx.db.delete(r._id)));
      }
      await ctx.db.delete(userId);
    },
  });
