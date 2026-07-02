"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toEpoch } from "@/lib/format";

export interface ReminderFormData {
  _id: Id<"reminders">;
  title: string;
  description: string;
  reminderDate: string;
  reminderTime: string;
}

export function ReminderDialog({
  open,
  onOpenChange,
  projectId,
  reminder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: Id<"projects">;
  reminder?: ReminderFormData | null;
}) {
  const create = useMutation(api.reminders.create);
  const update = useMutation(api.reminders.update);
  const editing = !!reminder;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(reminder?.title ?? "");
    setDescription(reminder?.description ?? "");
    setDate(reminder?.reminderDate ?? new Date().toISOString().slice(0, 10));
    setTime(reminder?.reminderTime ?? "09:00");
  }, [open, reminder]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Compute the scheduled instant in the *browser's* local timezone so it
      // round-trips correctly (the server runs in UTC).
      const dueAt = toEpoch(date, time);
      if (editing && reminder) {
        await update({
          reminderId: reminder._id,
          title,
          description,
          reminderDate: date,
          reminderTime: time,
          dueAt,
        });
        toast.success("Reminder updated");
      } else {
        await create({
          projectId,
          title,
          description,
          reminderDate: date,
          reminderTime: time,
          dueAt,
        });
        toast.success("Reminder added");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit reminder" : "New reminder"}
          </DialogTitle>
          <DialogDescription>
            Set a date and time — you&apos;ll get an in-app notification when it&apos;s due.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Send invoice"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional details…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Add reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
