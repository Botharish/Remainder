"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useQuery } from "convex/react";
import { LogOut, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import { signOut } from "@/lib/auth-client";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

export default function SettingsPage() {
  const router = useRouter();
  const me = useQuery(api.users.me);
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile and preferences."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information.</CardDescription>
        </CardHeader>
        <CardContent>
          {me === undefined ? (
            <Skeleton className="h-16 w-full" />
          ) : me ? (
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                {me.image ? <AvatarImage src={me.image} alt={me.name} /> : null}
                <AvatarFallback className="text-base">
                  {me.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{me.name}</p>
                  <Badge variant={me.role === "admin" ? "default" : "secondary"}>
                    {me.role}
                  </Badge>
                  <Badge variant="success">{me.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{me.email}</p>
                <p className="text-xs text-muted-foreground">
                  Joined {formatDate(me.createdAt)}
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how Remindly looks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-amber-400" />
              )}
              <div>
                <Label>Dark mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes.
                </p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Sign out of your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              toast.success("Signed out");
              router.replace("/login");
            }}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
