import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/admin";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const files = await ctx.db
      .query("privateFiles")
      .withIndex("by_uploadedAt")
      .order("desc")
      .take(200);
    // Do not return public storage URLs — clients use /private-file/:id with auth.
    return files.map((f) => ({
      _id: f._id,
      name: f.name,
      contentType: f.contentType,
      size: f.size,
      uploadedAt: f.uploadedAt,
      storageId: f.storageId,
    }));
  },
});

export const getMeta = query({
  args: { fileId: v.id("privateFiles") },
  handler: async (ctx, { fileId }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(fileId);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const save = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    contentType: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Name required");
    return await ctx.db.insert("privateFiles", {
      storageId: args.storageId,
      name,
      contentType: args.contentType || "application/octet-stream",
      size: args.size,
      uploadedAt: Date.now(),
      uploadedBy: userId,
    });
  },
});

export const rename = mutation({
  args: {
    fileId: v.id("privateFiles"),
    name: v.string(),
  },
  handler: async (ctx, { fileId, name }) => {
    await requireAdmin(ctx);
    const file = await ctx.db.get(fileId);
    if (!file) throw new Error("Not found");
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Name required");
    await ctx.db.patch(fileId, { name: trimmed });
  },
});

export const remove = mutation({
  args: { fileId: v.id("privateFiles") },
  handler: async (ctx, { fileId }) => {
    await requireAdmin(ctx);
    const file = await ctx.db.get(fileId);
    if (!file) return;
    await ctx.storage.delete(file.storageId);
    await ctx.db.delete(fileId);
  },
});
