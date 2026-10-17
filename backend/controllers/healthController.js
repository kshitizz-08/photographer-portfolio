/**
 * controllers/healthController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Public health check & uptime monitoring endpoints:
 *   - GET  /health, /api/health
 *   - HEAD /health, /api/health
 *   - GET  /ping,   /api/ping
 *   - HEAD /ping,   /api/ping
 *
 * Optimized for UptimeRobot, Render keep-alive, Cron-job.org, and container probes:
 *   1. Returns HTTP 200 immediately
 *   2. Sets no-cache headers to prevent proxy/CDN caching (ensures server is actually pinged)
 *   3. Supports HEAD requests (low bandwidth pings)
 *   4. Provides rich diagnostics: uptime, memory, database connectivity, and timestamp
 */

import mongoose from "mongoose";
import env from "../config/env.js";

/**
 * Format uptime seconds into human-readable string (e.g. "2d 5h 12m 4s")
 */
function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.length > 0 ? parts.join(" ") : "0s";
}

/**
 * GET & HEAD /health or /api/health
 * Primary health check endpoint for UptimeRobot & monitoring tools.
 */
export function getHealth(req, res) {
  // Prevent any intermediate proxy, CDN, or browser from caching the response
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
  });

  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStateLabel = ["disconnected", "connected", "connecting", "disconnecting"][dbState] ?? "unknown";

  const uptimeSeconds = Math.floor(process.uptime());
  const mem = process.memoryUsage();

  const payload = {
    success: true,
    status: "ok",
    message: "Server is online and healthy",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: `${uptimeSeconds}s`,
    uptimeFormatted: formatUptime(uptimeSeconds),
    database: {
      status: dbState === 1 ? "connected" : "disconnected",
      state: dbStateLabel,
      host: mongoose.connection.host ?? null,
    },
    system: {
      nodeVersion: process.version,
      memoryUsage: {
        heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
      },
    },
  };

  // Report degraded if DB is not connected (still returns 200 so the process
  // monitor knows the HTTP server is alive; a separate DB alert can check database.state).
  if (dbState !== 1) {
    payload.status = "degraded";
    payload.notice = "Database is not connected. API endpoints requiring data are unavailable.";
  }

  // Handle HEAD requests gracefully without body
  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  return res.status(200).json(payload);
}

/**
 * GET & HEAD /ping or /api/ping
 * Ultra-lightweight ping-pong endpoint for minimal network overhead.
 */
export function getPing(req, res) {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
  });

  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: "ok",
    message: "pong",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
}
