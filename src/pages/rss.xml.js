import rss from "@astrojs/rss";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export const prerender = false;

export async function GET(context) {
  const url = import.meta.env.PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  let items = [];

  if (url) {
    try {
      const client = new ConvexHttpClient(url);
      const posts = await client.query(anyApi.posts.listPublished, { limit: 50 });
      items = posts.map((post) => ({
        title: post.title,
        description: post.description,
        pubDate: new Date(post.pubDate),
        link: `/blog/${post.slug}/`,
      }));
    } catch (err) {
      console.error("RSS Convex fetch failed", err);
    }
  }

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items,
  });
}
