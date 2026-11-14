import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ConvexAppProvider from "./ConvexAppProvider";

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function BlogListInner() {
  const posts = useQuery(api.posts.listPublished, {});

  if (posts === undefined) {
    return <p className="loading-line">Loading posts…</p>;
  }

  return (
    <section>
      <ul className="blog-list">
        {posts.map((post) => (
          <li key={post._id}>
            <time dateTime={new Date(post.pubDate).toISOString()}>
              {formatDate(post.pubDate)}
            </time>
            <a href={`/blog/${post.slug}/`}>
              <p className="title">{post.title}</p>
            </a>
          </li>
        ))}
        {posts.length === 0 && <li>No published posts yet.</li>}
      </ul>
    </section>
  );
}

export default function BlogListApp() {
  return (
    <ConvexAppProvider>
      <BlogListInner />
    </ConvexAppProvider>
  );
}
