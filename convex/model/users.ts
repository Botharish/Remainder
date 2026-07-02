import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { betterAuthComponent } from "../auth";

/**
 * Shared user/authorization helpers used across Convex functions. Keeping the
 * logic here (rather than inline in each query/mutation) keeps authorization
 * consistent and testable.
 */

/** Resolve the app `users` profile for the current session, or null. */
export async function getAppUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users"> | null> {
  // getAuthUserId returns the app user's `_id` (linked via onCreateUser).
  const userId = await betterAuthComponent
    .getAuthUserId(ctx)
    .catch(() => null);
  if (!userId) return null;
  return ctx.db.get(userId as Id<"users">);
}

/** Throw unless there is a signed-in, approved app user. Returns the profile. */
export async function requireApprovedUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const user = await getAppUser(ctx);
  if (!user) throw new Error("Not authenticated.");
  if (user.status !== "approved") {
    throw new Error("Your account is awaiting admin approval.");
  }
  return user;
}

/** Throw unless the current user is an approved admin. Returns the profile. */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const user = await requireApprovedUser(ctx);
  if (user.role !== "admin") throw new Error("Admin access required.");
  return user;
}

/** Assert a project belongs to the given user (or the user is an admin). */
export async function assertProjectAccess(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  user: Doc<"users">,
): Promise<Doc<"projects">> {
  const project = await ctx.db.get(projectId);
  if (!project) throw new Error("Project not found.");
  if (project.userId !== user._id && user.role !== "admin") {
    throw new Error("You do not have access to this project.");
  }
  return project;
}
