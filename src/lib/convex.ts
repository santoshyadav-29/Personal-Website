import { ConvexReactClient } from "convex/react";

const url = import.meta.env.PUBLIC_CONVEX_URL;

if (!url) {
  console.warn(
    "PUBLIC_CONVEX_URL is not set. Convex-powered features will not work until it is configured.",
  );
}

export const convex = new ConvexReactClient(url ?? "http://127.0.0.1:3210");
