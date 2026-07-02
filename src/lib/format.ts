import { format, formatDistanceToNow, isPast } from "date-fns";

export function formatDateTime(ms: number) {
  return format(new Date(ms), "MMM d, yyyy · h:mm a");
}

export function formatDate(ms: number) {
  return format(new Date(ms), "MMM d, yyyy");
}

export function formatRelative(ms: number) {
  return formatDistanceToNow(new Date(ms), { addSuffix: true });
}

export function isOverdue(ms: number) {
  return isPast(new Date(ms));
}

/** Combine "YYYY-MM-DD" + "HH:MM" into an epoch ms (local time). */
export function toEpoch(date: string, time: string) {
  return new Date(`${date}T${time || "00:00"}:00`).getTime();
}
