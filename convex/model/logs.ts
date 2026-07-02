import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/**
 * Append an audit log entry. Called from mutations after a meaningful action
 * (login, project/reminder created, reminder completed, user approved, ...).
 */
export async function writeLog(
  ctx: MutationCtx,
  userId: Id<"users">,
  action: string,
  description: string,
) {
  await ctx.db.insert("logs", {
    userId,
    action,
    description,
    createdAt: Date.now(),
  });
}
