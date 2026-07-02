"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Bell, Plus, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReminderItem } from "@/components/reminders/reminder-item";
import {
  ReminderDialog,
  type ReminderFormData,
} from "@/components/reminders/reminder-dialog";

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId as Id<"projects">;

  const project = useQuery(api.projects.get, { projectId });
  const reminders = useQuery(api.reminders.listByProject, { projectId });
  const setCompleted = useMutation(api.reminders.setCompleted);
  const remove = useMutation(api.reminders.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ReminderFormData | null>(null);
  const [deleting, setDeleting] = useState<Doc<"reminders"> | null>(null);

  const { open, completed } = useMemo(() => {
    const list = reminders ?? [];
    return {
      open: list.filter((r) => !r.isCompleted),
      completed: list.filter((r) => r.isCompleted),
    };
  }, [reminders]);

  if (project === null) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Button asChild variant="link">
          <Link href="/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {project === undefined ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight">
              {project.projectName}
            </h1>
          )}
          {project && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              {project.clientName || "No client"}
            </p>
          )}
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add reminder
        </Button>
      </div>

      {reminders === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">No reminders yet</p>
              <p className="text-sm text-muted-foreground">
                Add a reminder to get notified at the right time.
              </p>
            </div>
            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="open">
          <TabsList>
            <TabsTrigger value="open">
              Open
              <Badge variant="secondary" className="ml-2 px-1.5 py-0">
                {open.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              <Badge variant="secondary" className="ml-2 px-1.5 py-0">
                {completed.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-3">
            {open.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                All caught up — no open reminders.
              </p>
            ) : (
              open.map((r) => (
                <ReminderRow
                  key={r._id}
                  reminder={r}
                  onToggle={setCompleted}
                  onEdit={() => {
                    setEditing(r);
                    setDialogOpen(true);
                  }}
                  onDelete={() => setDeleting(r)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {completed.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No completed reminders yet.
              </p>
            ) : (
              completed.map((r) => (
                <ReminderRow
                  key={r._id}
                  reminder={r}
                  onToggle={setCompleted}
                  onEdit={() => {
                    setEditing(r);
                    setDialogOpen(true);
                  }}
                  onDelete={() => setDeleting(r)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      <ReminderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectId={projectId}
        reminder={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete reminder?"
        description={`This permanently deletes "${deleting?.title}".`}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove({ reminderId: deleting._id });
            toast.success("Reminder deleted");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Delete failed");
          }
        }}
      />
    </div>
  );
}

function ReminderRow({
  reminder,
  onToggle,
  onEdit,
  onDelete,
}: {
  reminder: Doc<"reminders">;
  onToggle: (args: {
    reminderId: Id<"reminders">;
    isCompleted: boolean;
  }) => Promise<unknown>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <ReminderItem
      reminder={reminder}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggle={async (next) => {
        try {
          await onToggle({ reminderId: reminder._id, isCompleted: next });
          if (next) toast.success("Marked complete");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Update failed");
        }
      }}
    />
  );
}
