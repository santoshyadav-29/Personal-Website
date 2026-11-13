import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, getViewer } from "./lib/admin";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(ctx: { db: any }, base: string, excludeId?: string) {
  let slug = slugify(base) || "post";
  let i = 0;
  while (true) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q: any) => q.eq("slug", candidate))
      .unique();
    if (!existing || (excludeId && existing._id === excludeId)) {
      return candidate;
    }
    i += 1;
  }
}

async function withHeroUrl(ctx: { storage: any }, post: any) {
  let heroImageUrl: string | null = null;
  if (post.heroImageStorageId) {
    heroImageUrl = await ctx.storage.getUrl(post.heroImageStorageId);
  } else if (post.heroImagePath) {
    heroImageUrl = post.heroImagePath;
  }
  return { ...post, heroImageUrl };
}

export const listPublished = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published_pubDate", (q) => q.eq("published", true))
      .order("desc")
      .take(limit ?? 50);
    return Promise.all(posts.map((p) => withHeroUrl(ctx, p)));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!post) return null;
    if (!post.published) {
      const viewer = await getViewer(ctx);
      // Only admin can preview unpublished
      if (!viewer) return null;
      try {
        await requireAdmin(ctx);
      } catch {
        return null;
      }
    }
    return withHeroUrl(ctx, post);
  },
});

export const listAllAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const posts = await ctx.db.query("posts").order("desc").take(200);
    return Promise.all(posts.map((p) => withHeroUrl(ctx, p)));
  },
});

export const getAdmin = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    await requireAdmin(ctx);
    const post = await ctx.db.get(postId);
    if (!post) return null;
    return withHeroUrl(ctx, post);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    body: v.string(),
    slug: v.optional(v.string()),
    published: v.boolean(),
    pubDate: v.optional(v.number()),
    heroImagePath: v.optional(v.string()),
    heroImageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);
    const slug = await uniqueSlug(ctx, args.slug || args.title);
    const now = Date.now();
    return await ctx.db.insert("posts", {
      slug,
      title: args.title.trim(),
      description: args.description.trim(),
      body: args.body,
      published: args.published,
      pubDate: args.pubDate ?? now,
      updatedAt: now,
      authorId: userId,
      heroImagePath: args.heroImagePath,
      heroImageStorageId: args.heroImageStorageId,
    });
  },
});

export const update = mutation({
  args: {
    postId: v.id("posts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    body: v.optional(v.string()),
    slug: v.optional(v.string()),
    published: v.optional(v.boolean()),
    pubDate: v.optional(v.number()),
    heroImagePath: v.optional(v.string()),
    heroImageStorageId: v.optional(v.id("_storage")),
    clearHeroStorage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.description !== undefined) patch.description = args.description.trim();
    if (args.body !== undefined) patch.body = args.body;
    if (args.published !== undefined) patch.published = args.published;
    if (args.pubDate !== undefined) patch.pubDate = args.pubDate;
    if (args.heroImagePath !== undefined) patch.heroImagePath = args.heroImagePath;
    if (args.heroImageStorageId !== undefined) {
      patch.heroImageStorageId = args.heroImageStorageId;
    }
    if (args.clearHeroStorage) {
      if (post.heroImageStorageId) {
        await ctx.storage.delete(post.heroImageStorageId);
      }
      patch.heroImageStorageId = undefined;
    }
    if (args.slug !== undefined) {
      patch.slug = await uniqueSlug(ctx, args.slug, args.postId);
    }

    await ctx.db.patch(args.postId, patch);
    return args.postId;
  },
});

export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    await requireAdmin(ctx);
    const post = await ctx.db.get(postId);
    if (!post) return;
    if (post.heroImageStorageId) {
      await ctx.storage.delete(post.heroImageStorageId);
    }
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    for (const c of comments) await ctx.db.delete(c._id);
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    for (const l of likes) await ctx.db.delete(l._id);
    await ctx.db.delete(postId);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
