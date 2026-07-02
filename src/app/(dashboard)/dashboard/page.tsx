"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import {
  AlarmClock,
  CheckCircle2,
  Clock,
  FolderKanban,
  TriangleAlert,
} from "lucide-react";
import { api } from "@convex/_generated/api";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, isOverdue } from "@/lib/format";

export default function DashboardPage() {
  const summary = useQuery(api.dashboard.summary);
  const upcoming = useQuery(api.reminders.upcoming, { limit: 5 });
  const recent = useQuery(api.logs.recent, { limit: 8 });
  const loading = summary === undefined;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="An overview of your projects and reminders."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Projects"
          value={summary?.totalProjects ?? 0}
          icon={FolderKanban}
          accent="bg-primary/15 text-primary"
          loading={loading}
        />
        <StatCard
          label="Upcoming Reminders"
          value={summary?.upcomingReminders ?? 0}
          icon={Clock}
          accent="bg-sky-500/15 text-sky-400"
          loading={loading}
        />
        <StatCard
          label="Completed"
          value={summary?.completedReminders ?? 0}
          icon={CheckCircle2}
          accent="bg-emerald-500/15 text-emerald-400"
          loading={loading}
        />
        <StatCard
          label="Overdue"
          value={summary?.overdueReminders ?? 0}
          icon={TriangleAlert}
          accent="bg-amber-500/15 text-amber-400"
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Reminders created vs completed (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : (
              <ActivityChart data={summary.series} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlarmClock className="h-4 w-4 text-primary" /> Upcoming
            </CardTitle>
            <CardDescription>Your next reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming === undefined ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))
            ) : upcoming.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing scheduled. Enjoy the calm.
              </p>
            ) : (
              upcoming.map((r) => (
                <div
                  key={r._id}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug">{r.title}</p>
                    {isOverdue(r.dueAt) && (
                      <Badge variant="warning">Overdue</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.projectName} · {formatDateTime(r.dueAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </div>
          <Link
            href="/logs"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {recent === undefined ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <ActivityFeed items={recent} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
