import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Application schema.
 *
 * Authentication tables (user credentials, sessions, oauth accounts) are owned
 * by the Better Auth component and are NOT declared here. The `users` table
 * below is our *application profile* for each authenticated identity and holds
 * the role / approval status that gates access to the product.
 */
export const roleValidator = v.union(v.literal("admin"), v.literal("user"));
export const statusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

export default defineSchema({
  // Application profile for each authenticated identity. Its `_id` is what the
  // Better Auth component stores as the auth user's `userId` (set by the
  // `onCreateUser` hook), which is how the two are linked.
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: roleValidator,
    status: statusValidator,
    image: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  projects: defineTable({
    userId: v.id("users"),
    projectName: v.string(),
    clientName: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_name", ["userId", "projectName"]),

  reminders: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    // Stored as an epoch millisecond timestamp for the scheduled moment, plus
    // the human-entered date/time strings for display and editing.
    reminderDate: v.string(), // "2026-07-10"
    reminderTime: v.string(), // "14:30"
    dueAt: v.number(), // epoch ms of reminderDate + reminderTime
    isCompleted: v.boolean(),
    notifiedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_user_and_completed", ["userId", "isCompleted"])
    .index("by_dueAt", ["dueAt"]),

  logs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    description: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_createdAt", ["createdAt"]),
});
