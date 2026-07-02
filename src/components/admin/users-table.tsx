"use client";

import { useMutation } from "convex/react";
import { Check, MoreVertical, ShieldOff, UserCog, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/format";

const STATUS_VARIANT = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
} as const;

export function UsersTable({
  users,
  currentUserId,
}: {
  users: Doc<"users">[];
  currentUserId: string;
}) {
  const setStatus = useMutation(api.users.setStatus);
  const setRole = useMutation(api.users.setRole);

  async function run(fn: Promise<unknown>, message: string) {
    try {
      await fn;
      toast.success(message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Joined</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => (
            <tr key={u._id} className="hover:bg-accent/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {u.image ? <AvatarImage src={u.image} alt={u.name} /> : null}
                    <AvatarFallback className="text-xs">
                      {u.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {u.name}
                      {u._id === currentUserId && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                  {u.role}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[u.status]}>{u.status}</Badge>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                {formatDate(u.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {u.status !== "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-emerald-400"
                      onClick={() =>
                        run(
                          setStatus({ userId: u._id, status: "approved" }),
                          `Approved ${u.name}`,
                        )
                      }
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Manage user</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {u.status !== "approved" && (
                        <DropdownMenuItem
                          onClick={() =>
                            run(
                              setStatus({ userId: u._id, status: "approved" }),
                              `Approved ${u.name}`,
                            )
                          }
                        >
                          <Check className="h-4 w-4" /> Approve
                        </DropdownMenuItem>
                      )}
                      {u.status !== "rejected" && (
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-400"
                          onClick={() =>
                            run(
                              setStatus({ userId: u._id, status: "rejected" }),
                              `Rejected ${u.name}`,
                            )
                          }
                        >
                          <X className="h-4 w-4" /> Reject
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {u.role === "user" ? (
                        <DropdownMenuItem
                          onClick={() =>
                            run(
                              setRole({ userId: u._id, role: "admin" }),
                              `${u.name} is now an admin`,
                            )
                          }
                        >
                          <UserCog className="h-4 w-4" /> Make admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          disabled={u._id === currentUserId}
                          onClick={() =>
                            run(
                              setRole({ userId: u._id, role: "user" }),
                              `${u.name} is now a user`,
                            )
                          }
                        >
                          <ShieldOff className="h-4 w-4" /> Revoke admin
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
