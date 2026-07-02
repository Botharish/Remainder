"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellRing, PanelLeftClose, PanelLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  isAdmin: boolean;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  isAdmin,
}: SidebarProps) {
  const pathname = usePathname();
  const items = navItems.filter((i) => !i.adminOnly || isAdmin);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-200 lg:static lg:z-auto",
          collapsed ? "w-[68px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BellRing className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight">
              Remindly
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={onCloseMobile}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-border p-3 lg:block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={onToggleCollapse}
          >
            {collapsed ? (
              <PanelLeft className="h-[18px] w-[18px]" />
            ) : (
              <>
                <PanelLeftClose className="h-[18px] w-[18px]" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
