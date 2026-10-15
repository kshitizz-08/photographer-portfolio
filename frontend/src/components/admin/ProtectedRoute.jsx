/**
 * components/admin/ProtectedRoute.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps admin routes — redirects unauthenticated visitors to /admin/login.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { photographer, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#C4A882",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "1rem",
          letterSpacing: "0.05em",
        }}
      >
        <span style={{ opacity: 0.6 }}>Verifying session…</span>
      </div>
    );
  }

  if (!photographer) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
