import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { marked } from "marked";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import ConvexAppProvider from "../ConvexAppProvider";

type Tab = "files" | "posts" | "site";

function siteBase() {
  return (import.meta.env.PUBLIC_CONVEX_SITE_URL as string | undefined)?.replace(/\/$/, "");
}

function usePrivateFileUrl(fileId: Id<"privateFiles"> | null, token: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;
    async function load() {
      if (!fileId || !token) {
        setUrl(null);
        return;
      }
      const site = siteBase();
      if (!site) return;
      const res = await fetch(`${site}/private-file/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok || cancelled) return;
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      revoked = objectUrl;
      if (!cancelled) setUrl(objectUrl);
    }
    void load();
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [fileId, token]);
  return url;
}

function FilesPanel() {
  const token = useAuthToken();
  const files = useQuery(api.privateFiles.list);
  const generateUploadUrl = useMutation(api.privateFiles.generateUploadUrl);
  const save = useMutation(api.privateFiles.save);
  const rename = useMutation(api.privateFiles.rename);
  const remove = useMutation(api.privateFiles.remove);
  const [previewId, setPreviewId] = useState<Id<"privateFiles"> | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const previewUrl = usePrivateFileUrl(previewId, token);
  const previewMeta = files?.find((f) => f._id === previewId);

  async function onUpload(fileList: FileList | null) {
    if (!fileList?.length) return;
    setStatus("Uploading…");
    try {
      for (const file of Array.from(fileList)) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        const { storageId } = (await result.json()) as { storageId: Id<"_storage"> };
        await save({
          storageId,
          name: file.name,
          contentType: file.type || "application/octet-stream",
          size: file.size,
        });
      }
      setStatus("Upload complete");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function download(fileId: Id<"privateFiles">, name: string) {
    const site = siteBase();
    if (!token || !site) return;
    const res = await fetch(`${site}/private-file/${fileId}?download=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-panel">
      <h2>Private files</h2>
      <p className="auth-muted">
        Stored in Convex file storage. Served only through an authenticated admin
        proxy — no public listing or guessable gallery.
      </p>
      <label className="btn file-btn">
        Upload files
        <input
          type="file"
          multiple
          hidden
          onChange={(e) => void onUpload(e.target.files)}
        />
      </label>
      {status && <p>{status}</p>}
      <ul className="file-list">
        {(files ?? []).map((file) => (
          <li key={file._id}>
            <div>
              <strong>{file.name}</strong>
              <span className="auth-muted">
                {" "}
                · {file.contentType} · {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="row-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setPreviewId(file._id)}>
                Preview
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => void download(file._id, file.name)}
              >
                Download
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  const next = window.prompt("Rename file", file.name);
                  if (next) void rename({ fileId: file._id, name: next });
                }}
              >
                Rename
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm(`Delete ${file.name}?`)) {
                    void remove({ fileId: file._id });
                    if (previewId === file._id) setPreviewId(null);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {files?.length === 0 && <li className="auth-muted">No private files yet.</li>}
      </ul>

      {previewId && previewMeta && (
        <div className="preview-box">
          <h3>Preview: {previewMeta.name}</h3>
          {!previewUrl && <p>Loading preview…</p>}
          {previewUrl && previewMeta.contentType.startsWith("image/") && (
            <img src={previewUrl} alt={previewMeta.name} />
          )}
          {previewUrl && previewMeta.contentType === "application/pdf" && (
            <iframe title={previewMeta.name} src={previewUrl} className="pdf-frame" />
          )}
          {previewUrl && previewMeta.contentType.startsWith("text/") && (
            <TextPreview url={previewUrl} />
          )}
          {previewUrl &&
            !previewMeta.contentType.startsWith("image/") &&
            previewMeta.contentType !== "application/pdf" &&
            !previewMeta.contentType.startsWith("text/") && (
              <p className="auth-muted">No inline preview for this type — use Download.</p>
            )}
          <button type="button" className="btn btn-ghost" onClick={() => setPreviewId(null)}>
            Close preview
          </button>
        </div>
      )}
    </div>
  );
}

function TextPreview({ url }: { url: string }) {
  const [text, setText] = useState("Loading…");
  useEffect(() => {
    void fetch(url)
      .then((r) => r.text())
      .then(setText)
      .catch(() => setText("Could not load text"));
  }, [url]);
  return <pre className="text-preview">{text}</pre>;
}

function PostsPanel() {
  const posts = useQuery(api.posts.listAllAdmin);
  const create = useMutation(api.posts.create);
  const update = useMutation(api.posts.update);
  const remove = useMutation(api.posts.remove);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const [editingId, setEditingId] = useState<Id<"posts"> | null>(null);
  const editing = posts?.find((p) => p._id === editingId) ?? null;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(false);
  const [heroStorageId, setHeroStorageId] = useState<Id<"_storage"> | undefined>();
  const [message, setMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setDescription(editing.description);
      setSlug(editing.slug);
      setBody(editing.body);
      setPublished(editing.published);
      setHeroStorageId(editing.heroImageStorageId);
    }
  }, [editing]);

  const previewHtml = useMemo(
    () => (showPreview ? (marked.parse(body, { async: false }) as string) : ""),
    [body, showPreview],
  );

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setSlug("");
    setBody("");
    setPublished(false);
    setHeroStorageId(undefined);
    setShowPreview(false);
  }

  async function onHero(file: File | null) {
    if (!file) return;
    const uploadUrl = await generateUploadUrl();
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    const { storageId } = (await result.json()) as { storageId: Id<"_storage"> };
    setHeroStorageId(storageId);
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    try {
      if (editingId) {
        await update({
          postId: editingId,
          title,
          description,
          body,
          slug: slug || undefined,
          published,
          heroImageStorageId: heroStorageId,
        });
        setMessage("Post updated");
      } else {
        await create({
          title,
          description,
          body,
          slug: slug || undefined,
          published,
          heroImageStorageId: heroStorageId,
        });
        setMessage(published ? "Post published" : "Draft saved");
        resetForm();
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div className="admin-panel">
      <h2>Blog CMS</h2>
      <form className="admin-form" onSubmit={onSave}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Slug
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto from title if empty"
          />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            required
          />
        </label>
        <label>
          Body (markdown)
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} required />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
        <label>
          Cover image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => void onHero(e.target.files?.[0] ?? null)}
          />
        </label>
        <div className="row-actions">
          <button type="submit" className="btn">
            {editingId ? "Update post" : "Create post"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "Hide preview" : "Preview"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              New post
            </button>
          )}
        </div>
      </form>
      {message && <p>{message}</p>}
      {showPreview && (
        <div className="preview-box blog-body" dangerouslySetInnerHTML={{ __html: previewHtml }} />
      )}

      <h3>All posts</h3>
      <ul className="file-list">
        {(posts ?? []).map((post) => (
          <li key={post._id}>
            <div>
              <strong>{post.title}</strong>
              <span className="auth-muted">
                {" "}
                · /{post.slug}/ · {post.published ? "published" : "draft"}
              </span>
            </div>
            <div className="row-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditingId(post._id)}>
                Edit
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  void update({ postId: post._id, published: !post.published })
                }
              >
                {post.published ? "Unpublish" : "Publish"}
              </button>
              <a className="btn btn-ghost" href={`/blog/${post.slug}/`} target="_blank" rel="noreferrer">
                View
              </a>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm(`Delete “${post.title}”?`)) {
                    void remove({ postId: post._id });
                    if (editingId === post._id) resetForm();
                  }
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SECTION_KEYS = [
  { key: "introduction", label: "Introduction" },
  { key: "education", label: "Education" },
  { key: "projects", label: "Projects" },
  { key: "about", label: "About me" },
  { key: "faq", label: "FAQ" },
  { key: "links", label: "Links" },
] as const;

function SitePanel() {
  const sections = useQuery(api.siteContent.listAllAdmin);
  const upsert = useMutation(api.siteContent.upsert);
  const [key, setKey] = useState<(typeof SECTION_KEYS)[number]["key"]>("introduction");
  const [json, setJson] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const row = sections?.find((s) => s.key === key);
    setJson(row ? JSON.stringify(row.data, null, 2) : "{\n\n}");
  }, [sections, key]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    try {
      const data = JSON.parse(json);
      await upsert({ key, title: SECTION_KEYS.find((s) => s.key === key)?.label, data });
      setMessage("Section saved");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Invalid JSON");
    }
  }

  return (
    <div className="admin-panel">
      <h2>Site sections</h2>
      <p className="auth-muted">
        Edit the JSON for each homepage/about section. Changes appear on the public site
        immediately.
      </p>
      <div className="section-tabs">
        {SECTION_KEYS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`btn btn-ghost ${key === s.key ? "active" : ""}`}
            onClick={() => setKey(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <form className="admin-form" onSubmit={onSave}>
        <label>
          Data (JSON)
          <textarea value={json} onChange={(e) => setJson(e.target.value)} rows={18} required />
        </label>
        <button type="submit" className="btn">
          Save section
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

function AdminShell() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.users.viewer);
  const { signOut } = useAuthActions();
  const [tab, setTab] = useState<Tab>("posts");

  if (isLoading || viewer === undefined) {
    return <p className="loading-line">Checking access…</p>;
  }

  if (!isAuthenticated || !viewer) {
    return (
      <div className="admin-gate">
        <h1>Personal stuff</h1>
        <p>Sign in as the site admin to continue.</p>
        <a className="btn" href="/auth/">
          Sign in
        </a>
      </div>
    );
  }

  if (!viewer.isAdmin) {
    return (
      <div className="admin-gate">
        <h1>404</h1>
        <p>This page is private.</p>
        <a href="/">Go home</a>
      </div>
    );
  }

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div>
          <h1>Personal stuff</h1>
          <p className="auth-muted">{viewer.email}</p>
        </div>
        <div className="row-actions">
          <a className="btn btn-ghost" href="/">
            Public site
          </a>
          <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </header>
      <nav className="admin-nav">
        {(
          [
            ["posts", "Blog CMS"],
            ["site", "Site sections"],
            ["files", "Private files"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`btn btn-ghost ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "files" && <FilesPanel />}
      {tab === "posts" && <PostsPanel />}
      {tab === "site" && <SitePanel />}
    </div>
  );
}

export default function AdminApp() {
  return (
    <ConvexAppProvider>
      <AdminShell />
    </ConvexAppProvider>
  );
}
