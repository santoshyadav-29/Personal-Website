import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import ConvexAppProvider from "./ConvexAppProvider";

function AuthPanelInner() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.users.viewer);
  const oauth = useQuery(api.users.oauthAvailability);
  const { signIn, signOut } = useAuthActions();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading || viewer === undefined) {
    return <p className="auth-muted">Loading session…</p>;
  }

  if (isAuthenticated && viewer) {
    return (
      <div className="auth-signed-in">
        <p>
          Signed in as <strong>{viewer.email ?? viewer.name ?? "user"}</strong>
          {viewer.isAdmin ? " · admin" : ""}
        </p>
        <div className="auth-actions">
          {viewer.isAdmin && (
            <a className="btn" href="/personal-stuff/">
              Personal stuff
            </a>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <h2>{mode === "signIn" ? "Sign in" : "Create an account"}</h2>
      <p className="auth-muted">
        Public accounts can like and comment on blog posts. Admin access is granted
        server-side only.
      </p>
      <form onSubmit={onSubmit} className="auth-form">
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
            minLength={8}
            required
          />
        </label>
        <input name="flow" type="hidden" value={mode} />
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Please wait…" : mode === "signIn" ? "Sign in" : "Sign up"}
        </button>
      </form>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
      >
        {mode === "signIn" ? "Need an account? Sign up" : "Have an account? Sign in"}
      </button>
      {(oauth?.github || oauth?.google) && (
        <div className="auth-oauth">
          {oauth.github && (
            <button type="button" className="btn btn-ghost" onClick={() => void signIn("github")}>
              Continue with GitHub
            </button>
          )}
          {oauth.google && (
            <button type="button" className="btn btn-ghost" onClick={() => void signIn("google")}>
              Continue with Google
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuthPanel() {
  return (
    <ConvexAppProvider>
      <AuthPanelInner />
    </ConvexAppProvider>
  );
}
