import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getViewer, isAdminUser, requireAdmin } from "./lib/admin";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return null;
    return {
      _id: viewer.userId,
      name: viewer.user.name ?? null,
      email: viewer.user.email ?? null,
      image: viewer.user.image ?? null,
      isAdmin: isAdminUser(viewer.user),
    };
  },
});

export const oauthAvailability = query({
  args: {},
  handler: async () => {
    return {
      github: Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET),
      google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    };
  },
});

/**
 * Promote a user to admin by email. Callable only by an existing admin,
 * or when no admin exists yet and the caller matches ADMIN_EMAIL.
 */
export const promoteByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.trim().toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    const existingAdmins = (
      await ctx.db.query("users").collect()
    ).filter((u) => u.role === "admin" || (adminEmail && u.email?.toLowerCase() === adminEmail));

    const viewer = await getViewer(ctx);
    const callerIsAdmin = viewer ? isAdminUser(viewer.user) : false;
    const bootstrapping =
      existingAdmins.length === 0 &&
      adminEmail &&
      viewer?.user.email?.toLowerCase() === adminEmail;

    if (!callerIsAdmin && !bootstrapping) {
      // Still allow unauthenticated bootstrap via internal seed path only —
      // for this public mutation require the caller to already be the ADMIN_EMAIL user.
      if (!viewer || !adminEmail || viewer.user.email?.toLowerCase() !== adminEmail) {
        throw new Error("Forbidden");
      }
    }

    const users = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", normalized))
      .collect();
    // Email index may store mixed case; fall back to scan if needed.
    let user = users[0];
    if (!user) {
      const match = (await ctx.db.query("users").collect()).find(
        (u) => u.email?.toLowerCase() === normalized,
      );
      if (match) user = match;
    }
    if (!user) {
      throw new Error(`No user found with email ${email}`);
    }
    await ctx.db.patch(user._id, { role: "admin" });
    return user._id;
  },
});

export const setAdminRoleForEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Restricted: only when ADMIN_EMAIL matches the target (self-promote bootstrap)
    // or caller is already admin.
    const normalized = email.trim().toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!adminEmail) {
      throw new Error("ADMIN_EMAIL is not configured on the Convex deployment");
    }
    if (normalized !== adminEmail) {
      await requireAdmin(ctx);
    } else {
      const viewer = await getViewer(ctx);
      if (!viewer || viewer.user.email?.toLowerCase() !== adminEmail) {
        throw new Error("Sign in as the ADMIN_EMAIL user first");
      }
    }
    const user = (await ctx.db.query("users").collect()).find(
      (u) => u.email?.toLowerCase() === normalized,
    );
    if (!user) throw new Error("User not found — sign up first");
    await ctx.db.patch(user._id, { role: "admin" });
    return { ok: true as const };
  },
});
