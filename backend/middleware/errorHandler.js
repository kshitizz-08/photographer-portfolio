/**
 * middleware/errorHandler.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Express error-handling middleware (4-argument signature).
 *
 * Handles:
 *   - Mongoose CastError         → 400  (invalid ObjectId in URL param)
 *   - Mongoose ValidationError   → 422  (schema-level validation failures)
 *   - Mongoose duplicate key 11000 → 409 (unique constraint violations)
 *   - Custom err.status          → forwarded as-is
 *   - Everything else            → 500
 *
 * In production, internal error details are never leaked to the client.
 */

import env from "../config/env.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Always log the full error server-side
  console.error(`[error] ${req.method} ${req.originalUrl} →`, err);

  let status  = err.status || 500;
  let message = err.message || "An unexpected error occurred.";
  let errors  = undefined;

  // ── Mongoose: invalid ObjectId ───────────────────────────────────────────
  if (err.name === "CastError") {
    status  = 400;
    message = `Invalid value for field "${err.path}".`;
  }

  // ── Mongoose: schema validation ──────────────────────────────────────────
  if (err.name === "ValidationError") {
    status  = 422;
    message = "Validation failed.";
    errors  = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
  }

  // ── Mongoose: duplicate key ──────────────────────────────────────────────
  if (err.code === 11000) {
    status  = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with this ${field} already exists.`;
  }

  // ── Never expose internal details in production ──────────────────────────
  const body = {
    success: false,
    message,
    ...(errors && { errors }),
    // Include stack only in development — never in production
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(status).json(body);
}
