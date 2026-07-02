"use client";

import { Check, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Doc } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime, isOverdue } from "@/lib/format";

export function ReminderItem({
  reminder,
  onToggle,
  onEdit,
  onDelete,
}: {
  reminder: Doc<"reminders">;
  onToggle: (next: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const overdue = !reminder.isCompleted && isOverdue(reminder.dueAt);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border p-4 transition-colors",
        reminder.isCompleted && "opacity-60",
      )}
    >
      <button
        onClick={() => onToggle(!reminder.isCompleted)}
        aria-label={reminder.isCompleted ? "Mark incomplete" : "Mark complete"}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          reminder.isCompleted
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-muted-foreground/40 hover:border-primary",
        )}
      >
        {reminder.isCompleted && <Check className="h-3.5 w-3.5" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "font-medium",
              reminder.isCompleted && "line-through",
            )}
          >
            {reminder.title}
          </p>
          {overdue && <Badge variant="warning">Overdue</Badge>}
          {reminder.isCompleted && <Badge variant="success">Done</Badge>}
        </div>
        {reminder.description && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {reminder.description}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDateTime(reminder.dueAt)}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-400 focus:text-red-400"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
