import {
  Bell,
  CheckCircle2,
  FolderPlus,
  LogIn,
  Pencil,
  ShieldCheck,
  Trash2,
  Activity as ActivityIcon,
} from "lucide-react";
import { formatRelative } from "@/lib/format";

const ICONS: Record<string, typeof Bell> = {
  login: LogIn,
  project_created: FolderPlus,
  project_updated: Pencil,
  project_deleted: Trash2,
  reminder_created: Bell,
  reminder_updated: Pencil,
  reminder_completed: CheckCircle2,
  reminder_deleted: Trash2,
  user_approval: ShieldCheck,
  user_status_change: ShieldCheck,
  user_role_change: ShieldCheck,
};

export interface ActivityItem {
  _id: string;
  action: string;
  description: string;
  createdAt: number;
  actorName?: string;
}

export function ActivityFeed({
  items,
  showActor,
}: {
  items: ActivityItem[];
  showActor?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
        <ActivityIcon className="h-6 w-6 opacity-50" />
        No activity yet.
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = ICONS[item.action] ?? ActivityIcon;
        return (
          <li
            key={item._id}
            className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/50"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">
                {showActor && item.actorName ? (
                  <span className="font-medium">{item.actorName}: </span>
                ) : null}
                {item.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatRelative(item.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
