"use client";

import Link from "next/link";
import { Bell, MoreVertical, Pencil, Trash2, User } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelative } from "@/lib/format";

export interface ProjectCardData {
  _id: Id<"projects">;
  projectName: string;
  clientName: string;
  createdAt: number;
  reminderCount: number;
  openReminderCount: number;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: ProjectCardData;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group transition-colors hover:border-primary/40">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/projects/${project._id}`} className="min-w-0">
            <h3 className="truncate font-semibold group-hover:text-primary">
              {project.projectName}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              {project.clientName || "No client"}
            </p>
          </Link>
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

        <Link
          href={`/projects/${project._id}`}
          className="mt-4 flex items-center justify-between"
        >
          <Badge variant="secondary" className="gap-1">
            <Bell className="h-3 w-3" />
            {project.openReminderCount} open · {project.reminderCount} total
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatRelative(project.createdAt)}
          </span>
        </Link>
      </CardContent>
    </Card>
  );
}
