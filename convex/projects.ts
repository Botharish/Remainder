import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertProjectAccess, requireApprovedUser } from "./model/users";
import { writeLog } from "./model/logs";

/** List the current user's projects, with a live reminder count for each. */
export const list = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, { search }) => {
    const user = await requireApprovedUser(ctx);

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const term = search?.trim().toLowerCase();
    const filtered = term
      ? projects.filter(
          (p) =>
            p.projectName.toLowerCase().includes(term) ||
            p.clientName.toLowerCase().includes(term),
        )
      : projects;

    return Promise.all(
      filtered.map(async (project) => {
        const reminders = await ctx.db
          .query("reminders")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();
        return {
          ...project,
          reminderCount: reminders.length,
          openReminderCount: reminders.filter((r) => !r.isCompleted).length,
        };
      }),
    );
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const user = await requireApprovedUser(ctx);
    return assertProjectAccess(ctx, projectId, user);
  },
});

export const create = mutation({
  args: { projectName: v.string(), clientName: v.string() },
  handler: async (ctx, { projectName, clientName }) => {
    const user = await requireApprovedUser(ctx);
    const name = projectName.trim();
    const client = clientName.trim();
    if (!name) throw new Error("Project name is required.");

    const projectId = await ctx.db.insert("projects", {
      userId: user._id,
      projectName: name,
      clientName: client,
      createdAt: Date.now(),
    });

    await writeLog(
      ctx,
      user._id,
      "project_created",
      `Created project "${name}"${client ? ` for ${client}` : ""}.`,
    );
    return projectId;
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    projectName: v.string(),
    clientName: v.string(),
  },
  handler: async (ctx, { projectId, projectName, clientName }) => {
    const user = await requireApprovedUser(ctx);
    await assertProjectAccess(ctx, projectId, user);

    const name = projectName.trim();
    if (!name) throw new Error("Project name is required.");

    await ctx.db.patch(projectId, { projectName: name, clientName: clientName.trim() });
    await writeLog(ctx, user._id, "project_updated", `Updated project "${name}".`);
  },
});

export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const user = await requireApprovedUser(ctx);
    const project = await assertProjectAccess(ctx, projectId, user);

    // Cascade delete the project's reminders.
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    await Promise.all(reminders.map((r) => ctx.db.delete(r._id)));

    await ctx.db.delete(projectId);
    await writeLog(
      ctx,
      user._id,
      "project_deleted",
      `Deleted project "${project.projectName}" and ${reminders.length} reminder(s).`,
    );
  },
});
