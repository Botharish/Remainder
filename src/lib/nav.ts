import {
  LayoutDashboard,
  FolderKanban,
  ScrollText,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Logs", href: "/logs", icon: ScrollText },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Admin Panel", href: "/admin", icon: ShieldCheck, adminOnly: true },
];
