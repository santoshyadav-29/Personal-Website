import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  /**
   * Extend auth users with an optional admin role.
   * Admin access is primarily decided by ADMIN_EMAIL (server env),
   * with role="admin" as a secondary path set only by seed/CLI.
   */
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  siteSections: defineTable({
    key: v.string(),
    title: v.optional(v.string()),
    data: v.any(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  posts: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    body: v.string(),
    heroImagePath: v.optional(v.string()),
    heroImageStorageId: v.optional(v.id("_storage")),
    published: v.boolean(),
    pubDate: v.number(),
    updatedAt: v.optional(v.number()),
    authorId: v.optional(v.id("users")),
  })
    .index("by_slug", ["slug"])
    .index("by_published_pubDate", ["published", "pubDate"]),

  comments: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_post", ["postId"]),

  likes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
  })
    .index("by_post", ["postId"])
    .index("by_post_user", ["postId", "userId"]),

  privateFiles: defineTable({
    storageId: v.id("_storage"),
    name: v.string(),
    contentType: v.string(),
    size: v.number(),
    uploadedAt: v.number(),
    uploadedBy: v.id("users"),
  }).index("by_uploadedAt", ["uploadedAt"]),
});
