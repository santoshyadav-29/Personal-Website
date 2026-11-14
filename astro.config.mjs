import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";

const site = process.env.PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:4321";

// https://astro.build/config
export default defineConfig({
  site,
  output: "server",
  // Vercel sets VERCEL=1 during its build; keep the Node adapter for local preview.
  adapter: process.env.VERCEL ? vercel() : node({ mode: "standalone" }),
  integrations: [mdx(), sitemap(), react()],
});
