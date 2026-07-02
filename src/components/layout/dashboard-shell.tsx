"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Sidebar } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { useReminderNotifications } from "@/hooks/use-reminder-notifications";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const me = useQuery(api.users.me);

  // Live in-app reminder notifications, enabled once the profile is approved.
  useReminderNotifications(me?.status === "approved");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        isAdmin={me?.role === "admin"}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {me && (
              <UserMenu
                name={me.name}
                email={me.email}
                image={me.image}
                role={me.role}
              />
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
