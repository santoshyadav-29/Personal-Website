import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { marked } from "marked";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import ConvexAppProvider from "./ConvexAppProvider";

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Engagement({ postId }: { postId: Id<"posts"> }) {
  const likes = useQuery(api.likes.forPost, { postId });
  const comments = useQuery(api.comments.listForPost, { postId });
  const toggleLike = useMutation(api.likes.toggle);
  const addComment = useMutation(api.comments.add);
  const { isAuthenticated } = useConvexAuth();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await addComment({ postId, body });
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not comment");
    }
  }

  return (
    <div className="engagement">
      <div className="like-row">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={!isAuthenticated}
          onClick={() => void toggleLike({ postId }).catch((err) => setError(String(err)))}
        >
          {likes?.likedByMe ? "Unlike" : "Like"} ({likes?.count ?? 0})
        </button>
        {!isAuthenticated && (
          <a href="/auth/" className="auth-muted">
            Sign in to like or comment
          </a>
        )}
      </div>

      <div className="comments">
        <h2>Comments</h2>
        {isAuthenticated && (
          <form onSubmit={onComment} className="comment-form">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Share a thought…"
              required
              maxLength={2000}
            />
            <button type="submit" className="btn">
              Post comment
            </button>
          </form>
        )}
        {error && <p className="auth-error">{error}</p>}
        <ul className="comment-list">
          {(comments ?? []).map((c) => (
            <li key={c._id}>
              <p className="comment-meta">
                <strong>{c.author.name}</strong> · {formatDate(c.createdAt)}
              </p>
              <p>{c.body}</p>
            </li>
          ))}
          {comments?.length === 0 && <li className="auth-muted">No comments yet.</li>}
        </ul>
      </div>
    </div>
  );
}

function BlogPostInner({ slug }: { slug: string }) {
  const post = useQuery(api.posts.getBySlug, { slug });
  const html = useMemo(() => {
    if (!post) return "";
    return marked.parse(post.body, { async: false }) as string;
  }, [post]);

  if (post === undefined) return <p className="loading-line">Loading…</p>;
  if (post === null) {
    return (
      <main className="blog-page">
        <h1>Post not found</h1>
        <p>
          <a href="/blog/">Back to blog</a>
        </p>
      </main>
    );
  }

  return (
    <main>
      <div className="blog-head">
        <h1>{post.title}</h1>
        {post.heroImageUrl && <img src={post.heroImageUrl} alt={post.title} />}
        <p className="blog-date">
          <time dateTime={new Date(post.pubDate).toISOString()}>
            {formatDate(post.pubDate)}
          </time>
          {post.updatedAt && (
            <>
              {" "}
              (Updated:{" "}
              <time dateTime={new Date(post.updatedAt).toISOString()}>
                {formatDate(post.updatedAt)}
              </time>
              )
            </>
          )}
        </p>
      </div>
      <div className="blog-body" dangerouslySetInnerHTML={{ __html: html }} />
      <Engagement postId={post._id} />
    </main>
  );
}

export default function BlogPostApp({ slug }: { slug: string }) {
  return (
    <ConvexAppProvider>
      <BlogPostInner slug={slug} />
    </ConvexAppProvider>
  );
}
