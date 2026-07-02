"use client";

import { useQuery } from "convex/react";
import {
  ShieldCheck,
  ShieldX,
  Users2,
  UserCheck,
  UserCog,
} from "lucide-react";
import { api } from "@convex/_generated/api";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { UsersTable } from "@/components/admin/users-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  const me = useQuery(api.users.me);

  if (me === undefined) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!me || me.role !== "admin") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-red-400">
            <ShieldX className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">Admin access required</p>
            <p className="text-sm text-muted-foreground">
              You don&apos;t have permission to view this page.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <AdminPanel currentUserId={me._id} />;
}

function AdminPanel({ currentUserId }: { currentUserId: string }) {
  const stats = useQuery(api.users.stats);
  const users = useQuery(api.users.listAll);
  const logs = useQuery(api.logs.all, { limit: 200 });

  return (
    <div>
      <PageHeader
        title="Admin Panel"
        description="Approve users and monitor system activity."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats?.total ?? 0}
          icon={Users2}
          accent="bg-primary/15 text-primary"
          loading={stats === undefined}
        />
        <StatCard
          label="Pending"
          value={stats?.pending ?? 0}
          icon={UserCog}
          accent="bg-amber-500/15 text-amber-400"
          loading={stats === undefined}
        />
        <StatCard
          label="Approved"
          value={stats?.approved ?? 0}
          icon={UserCheck}
          accent="bg-emerald-500/15 text-emerald-400"
          loading={stats === undefined}
        />
        <StatCard
          label="Rejected"
          value={stats?.rejected ?? 0}
          icon={ShieldX}
          accent="bg-destructive/15 text-red-400"
          loading={stats === undefined}
        />
      </div>

      <Tabs defaultValue="users" className="mt-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> User management
              </CardTitle>
              <CardDescription>
                Approve or reject sign-ups and manage roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users === undefined ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <UsersTable users={users} currentUserId={currentUserId} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>All activity across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              {logs === undefined ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <ActivityFeed items={logs} showActor />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
