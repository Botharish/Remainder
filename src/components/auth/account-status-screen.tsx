"use client";

import { Clock, ShieldX } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountStatusScreen({
  status,
  name,
}: {
  status: "pending" | "rejected";
  name: string;
}) {
  const router = useRouter();
  const pending = status === "pending";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div
            className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
              pending ? "bg-amber-500/15 text-amber-400" : "bg-destructive/15 text-red-400"
            }`}
          >
            {pending ? <Clock className="h-6 w-6" /> : <ShieldX className="h-6 w-6" />}
          </div>
          <CardTitle>
            {pending ? "Awaiting approval" : "Access denied"}
          </CardTitle>
          <CardDescription>
            {pending
              ? `Thanks ${name.split(" ")[0]} — your account was created and is pending admin approval. You'll get access as soon as an admin approves it.`
              : "Your account request was rejected. Please contact an administrator if you believe this is a mistake."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              router.replace("/login");
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
