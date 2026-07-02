import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";
import { getAppUser, requireAdmin, requireApprovedUser } from "./model/users";

/** Attach the acting user's name/email to each log row for display. */
async function withUserNames(ctx: QueryCtx, logs: Doc<"logs">[]) {
  const cache = new Map<string, { name: string; email: string }>();
  return Promise.all(
    logs.map(async (log) => {
      let actor = cache.get(log.userId);
      if (!actor) {
        const u = await ctx.db.get(log.userId as Id<"users">);
        actor = { name: u?.name ?? "Unknown", email: u?.email ?? "" };
        cache.set(log.userId, actor);
      }
      return { ...log, actorName: actor.name, actorEmail: actor.email };
    }),
  );
}

/** Current user's own activity log, newest first. */
export const mine = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const user = await requireApprovedUser(ctx);
    const rows = await ctx.db
      .query("logs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit ?? 100);
    return withUserNames(ctx, rows);
  },
});

/** Recent activity for the dashboard feed. */
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const user = await getAppUser(ctx);
    if (!user || user.status !== "approved") return [];
    const rows = await ctx.db
      .query("logs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit ?? 8);
    return withUserNames(ctx, rows);
  },
});

/** System-wide logs for the admin panel, newest first. Admin only. */
export const all = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("logs")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit ?? 200);
    return withUserNames(ctx, rows);
  },
});
