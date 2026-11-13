import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import node from "@astrojs/node";

const site = process.env.PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:4321";

// https://astro.build/config
export default defineConfig({
  site,
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [mdx(), sitemap(), react()],
});
