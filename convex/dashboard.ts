import { query } from "./_generated/server";
import { requireApprovedUser } from "./model/users";

/**
 * Aggregated metrics + a small chart series for the dashboard, computed in a
 * single query so the client makes one round-trip.
 */
export const summary = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireApprovedUser(ctx);

    const [projects, reminders] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("reminders")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect(),
    ]);

    const now = Date.now();
    const completed = reminders.filter((r) => r.isCompleted);
    const open = reminders.filter((r) => !r.isCompleted);
    const upcoming = open.filter((r) => r.dueAt >= now);
    const overdue = open.filter((r) => r.dueAt < now);

    // 7-day activity series: reminders created per day for the last week.
    const days = 7;
    const series: { label: string; created: number; completed: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);
      const start = dayStart.getTime();
      const end = start + 24 * 60 * 60 * 1000;
      series.push({
        label: dayStart.toLocaleDateString(undefined, { weekday: "short" }),
        created: reminders.filter((r) => r.createdAt >= start && r.createdAt < end)
          .length,
        completed: reminders.filter(
          (r) => r.isCompleted && r._creationTime >= start && r._creationTime < end,
        ).length,
      });
    }

    return {
      totalProjects: projects.length,
      totalReminders: reminders.length,
      upcomingReminders: upcoming.length,
      completedReminders: completed.length,
      overdueReminders: overdue.length,
      series,
    };
  },
});
