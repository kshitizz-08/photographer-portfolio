/**
 * middleware/notFound.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Catches any request that did not match a registered route and forwards
 * a structured 404 error to the centralized error handler.
 */

export function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
}
