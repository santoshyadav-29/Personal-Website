import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/admin";

export const getSection = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    return await ctx.db
      .query("siteSections")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
  },
});

export const getMany = query({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      const row = await ctx.db
        .query("siteSections")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();
      out[key] = row?.data ?? null;
    }
    return out;
  },
});

export const listAllAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("siteSections").collect();
  },
});

export const upsert = mutation({
  args: {
    key: v.string(),
    title: v.optional(v.string()),
    data: v.any(),
  },
  handler: async (ctx, { key, title, data }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("siteSections")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { data, title, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("siteSections", {
      key,
      title,
      data,
      updatedAt: now,
    });
  },
});
