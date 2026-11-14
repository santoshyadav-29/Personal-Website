import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ConvexAppProvider from "./ConvexAppProvider";

function HeaderAuthInner() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.users.viewer);
  const { signOut } = useAuthActions();

  if (isLoading) return null;

  if (!isAuthenticated || !viewer) {
    return (
      <a className="header-auth-link" href="/auth/">
        Sign in
      </a>
    );
  }

  return (
    <div className="header-auth">
      {viewer.isAdmin && (
        <a className="header-auth-link" href="/personal-stuff/">
          Admin
        </a>
      )}
      <button type="button" className="header-auth-btn" onClick={() => void signOut()}>
        Sign out
      </button>
    </div>
  );
}

export default function HeaderAuth() {
  return (
    <ConvexAppProvider>
      <HeaderAuthInner />
    </ConvexAppProvider>
  );
}
