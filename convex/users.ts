import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAppUser, requireAdmin } from "./model/users";
import { writeLog } from "./model/logs";

/**
 * Return the current app profile (role + approval status) for the signed-in
 * user, or null if there is no session. The dashboard/layout uses this to gate
 * access. The profile itself is created by the `onCreateUser` hook in auth.ts
 * at sign-up, so there is no separate "ensure profile" step.
 */
export const me = query({
  args: {},
  handler: async (ctx) => {
    return getAppUser(ctx);
  },
});

/* -------------------------------------------------------------------------- */
/*  Admin                                                                     */
/* -------------------------------------------------------------------------- */

/** All users, newest first. Admin only. */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").order("desc").collect();
    return users;
  },
});

/** Users grouped counts for the admin overview. Admin only. */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    return {
      total: users.length,
      pending: users.filter((u) => u.status === "pending").length,
      approved: users.filter((u) => u.status === "approved").length,
      rejected: users.filter((u) => u.status === "rejected").length,
    };
  },
});

export const setStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  },
  handler: async (ctx, { userId, status }) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(userId);
    if (!target) throw new Error("User not found.");

    await ctx.db.patch(userId, { status });
    await writeLog(
      ctx,
      admin._id,
      status === "approved" ? "user_approval" : "user_status_change",
      `${admin.name} set ${target.email} to "${status}".`,
    );
  },
});

export const setRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, { userId, role }) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(userId);
    if (!target) throw new Error("User not found.");

    await ctx.db.patch(userId, { role });
    await writeLog(
      ctx,
      admin._id,
      "user_role_change",
      `${admin.name} set ${target.email} role to "${role}".`,
    );
  },
});
