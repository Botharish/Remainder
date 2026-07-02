"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { FolderKanban, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProjectDialog } from "@/components/projects/project-dialog";
import {
  ProjectCard,
  type ProjectCardData,
} from "@/components/projects/project-card";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const projects = useQuery(api.projects.list, { search });
  const remove = useMutation(api.projects.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectCardData | null>(null);
  const [deleting, setDeleting] = useState<ProjectCardData | null>(null);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Group your reminders by project and client."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New project
          </Button>
        }
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects or clients…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {projects === undefined ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">
                {search ? "No projects match your search" : "No projects yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {search
                  ? "Try a different search term."
                  : "Create your first project to start adding reminders."}
              </p>
            </div>
            {!search && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> New project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={() => {
                setEditing(project);
                setDialogOpen(true);
              }}
              onDelete={() => setDeleting(project)}
            />
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete project?"
        description={`This permanently deletes "${deleting?.projectName}" and all of its reminders.`}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove({ projectId: deleting._id as Id<"projects"> });
            toast.success("Project deleted");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Delete failed");
          }
        }}
      />
    </div>
  );
}
