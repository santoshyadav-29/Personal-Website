import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

type Ctx = QueryCtx | MutationCtx;

export async function getViewer(ctx: Ctx): Promise<{
  userId: Id<"users">;
  user: Doc<"users">;
} | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const user = await ctx.db.get(userId);
  if (!user) return null;
  return { userId, user };
}

export function isAdminUser(user: Doc<"users">): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail && user.email?.toLowerCase() === adminEmail) {
    return true;
  }
  return user.role === "admin";
}

export async function requireAdmin(ctx: Ctx): Promise<{
  userId: Id<"users">;
  user: Doc<"users">;
}> {
  const viewer = await getViewer(ctx);
  if (!viewer) {
    throw new Error("Not authenticated");
  }
  if (!isAdminUser(viewer.user)) {
    throw new Error("Forbidden");
  }
  return viewer;
}
