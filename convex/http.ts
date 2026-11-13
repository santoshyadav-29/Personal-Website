import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * Authenticated private-file proxy. Only the admin can fetch blobs.
 * Clients must send Authorization: Bearer <convex-auth-token>.
 */
http.route({
  pathPrefix: "/private-file/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const rawId = url.pathname.replace(/^\/private-file\//, "").replace(/\/$/, "");
    if (!rawId) {
      return new Response("Not found", { status: 404 });
    }

    const file = await ctx.runQuery(api.privateFiles.getMeta, {
      fileId: rawId as Id<"privateFiles">,
    });
    if (!file) {
      return new Response("Not found", { status: 404 });
    }

    const blob = await ctx.storage.get(file.storageId);
    if (!blob) {
      return new Response("Not found", { status: 404 });
    }

    const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";
    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": file.contentType || "application/octet-stream",
        "Content-Disposition": `${disposition}; filename="${file.name.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }),
});

export default http;
