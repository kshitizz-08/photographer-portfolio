/**
 * config/env.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Loads, validates, and exports all environment variables in one place.
 * Every other module imports from here — never from process.env directly.
 * This ensures misconfigured environments fail loudly at startup, not at
 * runtime inside a request handler.
 */

import "dotenv/config";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[config] Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name, fallback) {
  return process.env[name] ?? fallback;
}

function parseIntEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    throw new Error(`[config] Environment variable ${name} must be an integer, got: "${raw}"`);
  }
  return parsed;
}

const env = {
  NODE_ENV: optionalEnv("NODE_ENV", "development"),
  PORT:     parseIntEnv("PORT", 5000),

  // MongoDB — required for database-connected features.
  // The server starts without it in development (useful for health-check only).
  MONGODB_URI: optionalEnv("MONGODB_URI", optionalEnv("MONGO_URI", "")),
  MONGO_URI: optionalEnv("MONGODB_URI", optionalEnv("MONGO_URI", "")),

  // CORS — comma-separated list of allowed origins
  ALLOWED_ORIGINS: optionalEnv("ALLOWED_ORIGINS", "http://localhost:5173")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseIntEnv("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000), // 15 min
  RATE_LIMIT_MAX:       parseIntEnv("RATE_LIMIT_MAX", 100),

  // Stricter limit for inquiry submission endpoint
  INQUIRY_RATE_LIMIT_WINDOW_MS: parseIntEnv("INQUIRY_RATE_LIMIT_WINDOW_MS", 60 * 60 * 1000), // 1 hr
  INQUIRY_RATE_LIMIT_MAX:       parseIntEnv("INQUIRY_RATE_LIMIT_MAX", 10),

  // Authentication & session security
  JWT_SECRET: optionalEnv("JWT_SECRET", "photography-admin-super-secure-token-secret-2026"),
  ADMIN_COOKIE_NAME: optionalEnv("ADMIN_COOKIE_NAME", "photographer_admin_session"),
  LOGIN_RATE_LIMIT_WINDOW_MS: parseIntEnv("LOGIN_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000), // 15 min
  LOGIN_RATE_LIMIT_MAX:       parseIntEnv("LOGIN_RATE_LIMIT_MAX", 5), // 5 attempts per window
};

export default env;
