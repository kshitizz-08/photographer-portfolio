/**
 * utils/keepAlive.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Keep-alive self-ping utility.
 *
 * Designed for free hosting platforms (such as Render) that spin down web services
 * after 15 minutes of inactivity:
 * - If KEEP_ALIVE_URL or RENDER_EXTERNAL_URL is configured, this helper periodically
 *   (every 14 minutes) sends a lightweight HTTP ping to its own /health endpoint.
 * - This complements external monitors like UptimeRobot to ensure 24/7 uptime.
 */

import env from "../config/env.js";

export function initKeepAlive() {
  const rawUrl = env.KEEP_ALIVE_URL;
  if (!rawUrl) {
    return;
  }

  // Target /health or /ping endpoint
  const targetUrl = rawUrl.endsWith("/health") || rawUrl.endsWith("/ping")
    ? rawUrl
    : `${rawUrl.replace(/\/+$/, "")}/health`;

  // Render spins down after 15 minutes of inactivity; ping every 14 minutes (840,000ms)
  const INTERVAL_MS = 14 * 60 * 1000;

  console.log(`[keep-alive] Self-ping scheduled for ${targetUrl} (every 14 min)`);

  const timer = setInterval(async () => {
    try {
      const res = await fetch(targetUrl, {
        headers: { "User-Agent": "PhotographerBackend-KeepAlive/1.0" },
      });
      console.log(`[keep-alive] Self-ping status: ${res.status} (${new Date().toLocaleTimeString()})`);
    } catch (err) {
      console.warn(`[keep-alive] Self-ping failed: ${err.message}`);
    }
  }, INTERVAL_MS);

  // Unref timer so it doesn't prevent Node process from graceful shutdown
  if (timer.unref) {
    timer.unref();
  }
}
