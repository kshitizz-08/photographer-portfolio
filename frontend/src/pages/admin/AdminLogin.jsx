/**
 * pages/admin/AdminLogin.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Photographer-only login page for the private admin panel.
 * - Rate-limited on backend (5 attempts / 15 min)
 * - Prevents double-submit
 * - Shows branded loading screen during session verification (no blank flash)
 * - Show/hide password toggle for usability
 * - Redirects to /admin/dashboard on success
 */

import { useState, useRef } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Inline keyframes injected once per mount
const KEYFRAMES = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const S = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0a 0%, #141414 40%, #1a1510 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "1.5rem",
    position: "relative",
    overflow: "hidden",
  },
  bgAccent: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(196,168,130,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    background: "rgba(20, 20, 20, 0.85)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(196, 168, 130, 0.2)",
    borderRadius: "1.5rem",
    padding: "2.5rem 2rem",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(196,168,130,0.05) inset",
    animation: "fadeInUp 0.4s ease-out both",
  },
  logoArea: { textAlign: "center", marginBottom: "2rem" },
  logoIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(196,168,130,0.2) 0%, rgba(196,168,130,0.05) 100%)",
    border: "1px solid rgba(196,168,130,0.3)",
    marginBottom: "1rem",
  },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#FAF9F7",
    margin: "0 0 0.25rem",
    letterSpacing: "-0.01em",
  },
  subtitle: { fontSize: "0.85rem", color: "#6b6b6b", margin: 0, letterSpacing: "0.02em" },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#9a9a9a",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  inputWrap: { position: "relative" },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "0.625rem",
    color: "#FAF9F7",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "rgba(196, 168, 130, 0.5)",
    boxShadow: "0 0 0 3px rgba(196, 168, 130, 0.1)",
  },
  eyeBtn: {
    position: "absolute",
    right: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.25rem",
    color: "#6b6b6b",
    display: "flex",
    alignItems: "center",
    lineHeight: 1,
    fontSize: "0.9rem",
  },
  button: {
    width: "100%",
    padding: "0.875rem 1.5rem",
    background: "linear-gradient(135deg, #C4A882 0%, #a8895f 100%)",
    border: "none",
    borderRadius: "0.625rem",
    color: "#141414",
    fontSize: "0.9rem",
    fontWeight: 700,
    fontFamily: "inherit",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.15s",
    marginTop: "0.25rem",
  },
  buttonDisabled: { opacity: 0.5, cursor: "not-allowed" },
  errorBox: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    borderRadius: "0.625rem",
    padding: "0.75rem 1rem",
    color: "#f87171",
    fontSize: "0.85rem",
    lineHeight: 1.5,
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.75rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  footerText: { fontSize: "0.75rem", color: "#4a4a4a", letterSpacing: "0.02em" },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    fontSize: "0.75rem",
    color: "#6b6b6b",
    textDecoration: "none",
    marginTop: "0.5rem",
    transition: "color 0.2s",
  },
};

/** Branded loading screen — shown while the session cookie is being verified */
function SessionLoadingScreen() {
  return (
    <div style={S.root}>
      <style>{KEYFRAMES}</style>
      <div style={S.bgAccent} />
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "36px",
          height: "36px",
          border: "2px solid rgba(196,168,130,0.2)",
          borderTopColor: "#C4A882",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 1rem",
        }} />
        <p style={{ fontSize: "0.82rem", color: "#6b6b6b", letterSpacing: "0.06em", margin: 0 }}>
          Verifying session…
        </p>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  const { photographer, authLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from     = location.state?.from?.pathname || "/admin/dashboard";

  const [email, setEmail]          = useState("");
  const [password, setPassword]    = useState("");
  const [showPw, setShowPw]        = useState(false);
  const [error, setError]          = useState(null);
  const [loading, setLoading]      = useState(false);
  const [focused, setFocused]      = useState(null);
  const submitting                 = useRef(false);

  // ① While verifying existing session cookie — show branded spinner
  if (authLoading) return <SessionLoadingScreen />;

  // ② Already authenticated — skip login
  if (photographer) return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting.current) return;
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    submitting.current = true;
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
      submitting.current = false;
    }
  }

  return (
    <div style={S.root}>
      <style>{KEYFRAMES}</style>
      <div style={S.bgAccent} />

      <div style={S.card}>
        {/* ── Branding ─────────────────────────────────────────────────────── */}
        <div style={S.logoArea}>
          <div style={S.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a3 3 0 110 6 3 3 0 010-6zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z"
                fill="#C4A882"
              />
            </svg>
          </div>
          <h1 style={S.title}>Admin Portal</h1>
          <p style={S.subtitle}>Photographer access only</p>
        </div>

        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <form id="admin-login-form" onSubmit={handleSubmit} style={S.form} noValidate>

          {error && (
            <div style={S.errorBox} role="alert" aria-live="polite">
              <span aria-hidden="true">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div style={S.fieldGroup}>
            <label htmlFor="admin-email" style={S.label}>Email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              placeholder="your@email.com"
              disabled={loading}
              required
              style={{ ...S.input, ...(focused === "email" ? S.inputFocus : {}) }}
            />
          </div>

          {/* Password */}
          <div style={S.fieldGroup}>
            <label htmlFor="admin-password" style={S.label}>Password</label>
            <div style={S.inputWrap}>
              <input
                id="admin-password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                disabled={loading}
                required
                style={{
                  ...S.input,
                  paddingRight: "2.75rem",
                  ...(focused === "password" ? S.inputFocus : {}),
                }}
              />
              <button
                id="toggle-password-visibility"
                type="button"
                aria-label={showPw ? "Hide password" : "Show password"}
                onClick={() => setShowPw((v) => !v)}
                style={S.eyeBtn}
                tabIndex={-1}
              >
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            style={{ ...S.button, ...(loading ? S.buttonDisabled : {}) }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div style={S.footer}>
          <p style={S.footerText}>Private area — no public registration</p>
          <a
            href="/"
            style={S.backLink}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#C4A882"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b6b"; }}
          >
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
