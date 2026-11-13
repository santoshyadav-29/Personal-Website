import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getViewer } from "./lib/admin";

export const forPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get(postId);
    if (!post || !post.published) {
      return { count: 0, likedByMe: false };
    }
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    const viewer = await getViewer(ctx);
    const likedByMe = viewer
      ? likes.some((l) => l.userId === viewer.userId)
      : false;
    return { count: likes.length, likedByMe };
  },
});

export const toggle = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const viewer = await getViewer(ctx);
    if (!viewer) throw new Error("Sign in to like posts");
    const post = await ctx.db.get(postId);
    if (!post || !post.published) throw new Error("Post not found");

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_post_user", (q) =>
        q.eq("postId", postId).eq("userId", viewer.userId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    }
    await ctx.db.insert("likes", { postId, userId: viewer.userId });
    return { liked: true };
  },
});
