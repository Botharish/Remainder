import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import {
  assertProjectAccess,
  requireApprovedUser,
} from "./model/users";
import { writeLog } from "./model/logs";

/**
 * `dueAt` (epoch ms) is computed on the client from the user's local timezone
 * and passed in, so the scheduled instant round-trips correctly regardless of
 * the server timezone. We keep the `reminderDate`/`reminderTime` strings for
 * display and editing. This helper just guards against a bad value.
 */
function assertValidDueAt(dueAt: number): number {
  if (!Number.isFinite(dueAt)) throw new Error("Invalid reminder date/time.");
  return dueAt;
}

/** Reminders for a single project (oldest due first). */
export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const user = await requireApprovedUser(ctx);
    await assertProjectAccess(ctx, projectId, user);
    return ctx.db
      .query("reminders")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect()
      .then((rows) => rows.sort((a, b) => a.dueAt - b.dueAt));
  },
});

/** Upcoming (not completed, due in the future) reminders across all projects. */
export const upcoming = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const user = await requireApprovedUser(ctx);
    const rows = await ctx.db
      .query("reminders")
      .withIndex("by_user_and_completed", (q) =>
        q.eq("userId", user._id).eq("isCompleted", false),
      )
      .collect();

    const now = Date.now();
    const sorted = rows
      .filter((r) => r.dueAt >= now)
      .sort((a, b) => a.dueAt - b.dueAt);

    const sliced = limit ? sorted.slice(0, limit) : sorted;
    return withProjectNames(ctx, sliced);
  },
});

/**
 * Reminders that are due now (past their `dueAt`), not completed, and not yet
 * notified. The client polls this and pops in-app notifications, then calls
 * `markNotified`.
 */
export const due = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireApprovedUser(ctx);
    const rows = await ctx.db
      .query("reminders")
      .withIndex("by_user_and_completed", (q) =>
        q.eq("userId", user._id).eq("isCompleted", false),
      )
      .collect();

    const now = Date.now();
    const dueRows = rows.filter((r) => r.dueAt <= now && !r.notifiedAt);
    return withProjectNames(ctx, dueRows);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(),
    reminderDate: v.string(),
    reminderTime: v.string(),
    dueAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireApprovedUser(ctx);
    await assertProjectAccess(ctx, args.projectId, user);

    const title = args.title.trim();
    if (!title) throw new Error("Reminder title is required.");

    const reminderId = await ctx.db.insert("reminders", {
      projectId: args.projectId,
      userId: user._id,
      title,
      description: args.description.trim(),
      reminderDate: args.reminderDate,
      reminderTime: args.reminderTime,
      dueAt: assertValidDueAt(args.dueAt),
      isCompleted: false,
      createdAt: Date.now(),
    });

    await writeLog(
      ctx,
      user._id,
      "reminder_created",
      `Added reminder "${title}" due ${args.reminderDate} ${args.reminderTime}.`,
    );
    return reminderId;
  },
});

export const update = mutation({
  args: {
    reminderId: v.id("reminders"),
    title: v.string(),
    description: v.string(),
    reminderDate: v.string(),
    reminderTime: v.string(),
    dueAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireApprovedUser(ctx);
    const reminder = await ctx.db.get(args.reminderId);
    if (!reminder) throw new Error("Reminder not found.");
    await assertProjectAccess(ctx, reminder.projectId, user);

    const title = args.title.trim();
    if (!title) throw new Error("Reminder title is required.");

    await ctx.db.patch(args.reminderId, {
      title,
      description: args.description.trim(),
      reminderDate: args.reminderDate,
      reminderTime: args.reminderTime,
      dueAt: assertValidDueAt(args.dueAt),
      // Re-scheduling clears the notified flag so it can fire again.
      notifiedAt: undefined,
    });
    await writeLog(ctx, user._id, "reminder_updated", `Updated reminder "${title}".`);
  },
});

export const setCompleted = mutation({
  args: { reminderId: v.id("reminders"), isCompleted: v.boolean() },
  handler: async (ctx, { reminderId, isCompleted }) => {
    const user = await requireApprovedUser(ctx);
    const reminder = await ctx.db.get(reminderId);
    if (!reminder) throw new Error("Reminder not found.");
    await assertProjectAccess(ctx, reminder.projectId, user);

    await ctx.db.patch(reminderId, { isCompleted });
    if (isCompleted) {
      await writeLog(
        ctx,
        user._id,
        "reminder_completed",
        `Completed reminder "${reminder.title}".`,
      );
    }
  },
});

/** Mark a reminder as already notified so it doesn't pop again. */
export const markNotified = mutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, { reminderId }) => {
    const user = await requireApprovedUser(ctx);
    const reminder = await ctx.db.get(reminderId);
    if (!reminder || reminder.userId !== user._id) return;
    await ctx.db.patch(reminderId, { notifiedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, { reminderId }) => {
    const user = await requireApprovedUser(ctx);
    const reminder = await ctx.db.get(reminderId);
    if (!reminder) throw new Error("Reminder not found.");
    await assertProjectAccess(ctx, reminder.projectId, user);

    await ctx.db.delete(reminderId);
    await writeLog(
      ctx,
      user._id,
      "reminder_deleted",
      `Deleted reminder "${reminder.title}".`,
    );
  },
});

/* -------------------------------------------------------------------------- */

/** Attach the parent project name to a set of reminders for display. */
async function withProjectNames(
  ctx: QueryCtx,
  reminders: Doc<"reminders">[],
) {
  const cache = new Map<string, string>();
  return Promise.all(
    reminders.map(async (r) => {
      let projectName = cache.get(r.projectId);
      if (projectName === undefined) {
        const project = await ctx.db.get(r.projectId);
        projectName = project?.projectName ?? "Unknown project";
        cache.set(r.projectId, projectName);
      }
      return { ...r, projectName };
    }),
  );
}
