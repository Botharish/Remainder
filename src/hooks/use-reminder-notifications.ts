"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";

/**
 * Polls Convex for reminders whose scheduled time has arrived and pops an
 * in-app toast for each, then marks them notified so they don't fire twice.
 *
 * Convex's `useQuery` is reactive, so the `due` list also updates live as the
 * clock passes each reminder's due time (the query re-runs on any data change);
 * the interval below nudges re-evaluation for purely time-based transitions.
 */
export function useReminderNotifications(enabled: boolean) {
  const due = useQuery(api.reminders.due, enabled ? {} : "skip");
  const markNotified = useMutation(api.reminders.markNotified);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!due || due.length === 0) return;
    for (const reminder of due) {
      if (seen.current.has(reminder._id)) continue;
      seen.current.add(reminder._id);

      toast.info(`⏰ ${reminder.title}`, {
        description: `${reminder.projectName} · due now${
          reminder.description ? ` — ${reminder.description}` : ""
        }`,
        duration: 10000,
      });
      markNotified({ reminderId: reminder._id }).catch(() => {});
    }
  }, [due, markNotified]);
}
