/**
 * controllers/healthController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/health
 * Public endpoint for uptime monitoring, load-balancer health checks, and
 * verifying the server has started correctly.
 */

import mongoose from "mongoose";
import env from "../config/env.js";

export function getHealth(req, res) {
  const dbState = mongoose.connection.readyState;

  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStateLabel = ["disconnected", "connected", "connecting", "disconnecting"][dbState] ?? "unknown";

  const payload = {
    success:   true,
    status:    "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: {
      state: dbStateLabel,
      // Only expose the host segment — never the full URI with credentials
      host:  mongoose.connection.host ?? null,
    },
    uptime: `${Math.floor(process.uptime())}s`,
  };

  // Report degraded if DB is not connected (still returns 200 so the process
  // monitor knows the server is alive; a separate DB check can alert on the
  // database.state field).
  if (dbState !== 1) {
    payload.status = "degraded";
    payload.notice = "Database is not connected. API endpoints requiring data are unavailable.";
  }

  res.status(200).json(payload);
}
