import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getViewer } from "./lib/admin";

export const listForPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get(postId);
    if (!post || !post.published) return [];

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .order("desc")
      .take(100);

    return await Promise.all(
      comments.map(async (c) => {
        const user = await ctx.db.get(c.userId);
        return {
          _id: c._id,
          body: c.body,
          createdAt: c.createdAt,
          author: {
            name: user?.name ?? user?.email ?? "Someone",
            email: user?.email ?? null,
          },
        };
      }),
    );
  },
});

export const add = mutation({
  args: {
    postId: v.id("posts"),
    body: v.string(),
  },
  handler: async (ctx, { postId, body }) => {
    const viewer = await getViewer(ctx);
    if (!viewer) throw new Error("Sign in to comment");
    const post = await ctx.db.get(postId);
    if (!post || !post.published) throw new Error("Post not found");
    const trimmed = body.trim();
    if (trimmed.length < 1 || trimmed.length > 2000) {
      throw new Error("Comment must be 1–2000 characters");
    }
    return await ctx.db.insert("comments", {
      postId,
      userId: viewer.userId,
      body: trimmed,
      createdAt: Date.now(),
    });
  },
});
