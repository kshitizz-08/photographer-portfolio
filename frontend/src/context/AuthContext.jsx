/**
 * context/AuthContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides authentication state for the photographer's admin panel.
 * Verifies existing sessions on mount via GET /api/admin/me.
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { adminLogin as apiLogin, adminLogout as apiLogout, getAdminMe } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [photographer, setPhotographer]   = useState(null);
  const [authLoading, setAuthLoading]     = useState(true); // initial session check
  const [authError, setAuthError]         = useState(null);

  // ── Check session on mount ────────────────────────────────────────────────
  useEffect(() => {
    // Skip API call if no token is stored — avoids waking the backend for public visitors
    const storedToken = typeof window !== "undefined"
      ? localStorage.getItem("photographer_admin_token")
      : null;

    if (!storedToken) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await getAdminMe();
        if (!cancelled) setPhotographer(data.photographer ?? null);
      } catch {
        if (typeof window !== "undefined") {
          localStorage.removeItem("photographer_admin_token");
        }
        if (!cancelled) setPhotographer(null);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);


  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setAuthError(null);
    const data = await apiLogin(email, password);
    setPhotographer(data.photographer);
    return data;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setPhotographer(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ photographer, authLoading, authError, setAuthError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
