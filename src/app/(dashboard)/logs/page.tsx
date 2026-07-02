"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export default function LogsPage() {
  const logs = useQuery(api.logs.mine, { limit: 200 });

  return (
    <div>
      <PageHeader
        title="Logs"
        description="A record of every action across your account."
      />
      <Card>
        <CardContent className="p-4 sm:p-6">
          {logs === undefined ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <ActivityFeed items={logs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
