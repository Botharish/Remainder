"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";

export default function RootPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    router.replace(session ? "/dashboard" : "/login");
  }, [isPending, session, router]);

  return <FullScreenLoader label="Loading Remindly…" />;
}
