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

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: {
    _id: Id<"projects">;
    projectName: string;
    clientName: string;
  } | null;
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
}: ProjectDialogProps) {
  const create = useMutation(api.projects.create);
  const update = useMutation(api.projects.update);
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [saving, setSaving] = useState(false);
  const editing = !!project;

  useEffect(() => {
    if (open) {
      setProjectName(project?.projectName ?? "");
      setClientName(project?.clientName ?? "");
    }
  }, [open, project]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing && project) {
        await update({ projectId: project._id, projectName, clientName });
        toast.success("Project updated");
      } else {
        await create({ projectName, clientName });
        toast.success("Project created");
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
          <DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the project details."
              : "Create a project to group related reminders."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project name</Label>
            <Input
              id="projectName"
              placeholder="Website redesign"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientName">Client name</Label>
            <Input
              id="clientName"
              placeholder="Acme Inc."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
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
              {editing ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
