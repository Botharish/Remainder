"use client";

import { BellRing } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleButton } from "@/components/auth/google-button";

export default function LoginPage() {
  return (
    <Card className="border-border/60 shadow-2xl">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BellRing className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-2xl">Welcome to Remindly</CardTitle>
          <CardDescription>
            Sign in with Google to access your workspace
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleButton label="Continue with Google" />
        <p className="text-center text-xs text-muted-foreground">
          New accounts are created automatically and require admin approval
          before you can access the dashboard.
        </p>
      </CardContent>
    </Card>
  );
}
