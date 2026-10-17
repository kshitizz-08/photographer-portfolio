/**
 * server.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Photography Portfolio API — Express application entry point.
 *
 * Startup sequence:
 *   1. Load and validate environment variables
 *   2. Configure Express middleware stack
 *   3. Attempt MongoDB connection (non-blocking in development)
 *   4. Mount API routes
 *   5. Attach 404 + centralized error handler
 *   6. Start HTTP server
 */

import express       from "express";
import helmet        from "helmet";
import cors          from "cors";
import morgan        from "morgan";

import cookieParser from "cookie-parser";

import env           from "./config/env.js";
import connectDB     from "./config/db.js";
import apiRouter     from "./routes/index.js";
import { getHealth, getPing } from "./controllers/healthController.js";
import { initKeepAlive } from "./utils/keepAlive.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { notFound }  from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

// ── 1. App instance ───────────────────────────────────────────────────────────
const app = express();

// ── 2. Security headers (Helmet) ──────────────────────────────────────────────
app.use(
  helmet({
    // Allow images from Unsplash and any configured CDN in CSP
    contentSecurityPolicy: false, // disable default CSP — configure per-deployment
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ── 3. CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // In development, permit any localhost or 127.0.0.1 port (e.g. 5173, 5174, etc.)
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (env.NODE_ENV !== "production" && isLocalhost) {
        return callback(null, true);
      }

      // Check against configured allowed origins
      const normalizedOrigin = origin.replace(/\/+$/, "");
      if (env.ALLOWED_ORIGINS.some((allowed) => allowed === normalizedOrigin)) {
        return callback(null, true);
      }

      callback(new Error(`CORS: origin "${origin}" is not allowed.`));
    },
    methods:        ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials:    true,
  })
);

// ── 4. Request body parsing & cookies ──────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));      // reject oversized JSON payloads
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(cookieParser());                      // parse HTTP-only auth cookies

// ── 5. HTTP request logging ───────────────────────────────────────────────────
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// ── 6. Health & Keep-Alive endpoints (UptimeRobot, Render probes) ─────────────
// Mounted at root BEFORE rate limiting so uptime monitors are never throttled
app.route("/health").get(getHealth).head(getHealth);
app.route("/ping").get(getPing).head(getPing);

// ── 7. General rate limiter (all /api routes) ─────────────────────────────────
app.use("/api", generalLimiter);

// ── 8. API routes ─────────────────────────────────────────────────────────────
app.use("/api", apiRouter);
// Fallback in case frontend sends request without /api prefix
app.use(apiRouter);

// ── 9. Root ping (non-API) ────────────────────────────────────────────────────
app.route("/").get((req, res) => {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
  });
  res.json({
    status:  "ok",
    message: "Photography Portfolio API is online",
    health:  "/health",
    apiHealth: "/api/health",
    ping:    "/ping",
    version: "1.0.0",
  });
}).head((req, res) => {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
  });
  res.status(200).end();
});

// ── 10. 404 handler ───────────────────────────────────────────────────────────
app.use(notFound);

// ── 11. Centralized error handler ────────────────────────────────────────────
app.use(errorHandler);

// ── 12. Start server ─────────────────────────────────────────────────────────
async function start() {
  // Bind HTTP server immediately so Render detects port binding and can handle pings/health checks
  app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`\n[server] Running in ${env.NODE_ENV} mode`);
    console.log(`[server] Listening on port ${env.PORT}`);
    console.log(`[server] Uptime health: http://localhost:${env.PORT}/health`);
    console.log(`[server] API health:    http://localhost:${env.PORT}/api/health`);
    console.log(`[server] Fast ping:     http://localhost:${env.PORT}/ping\n`);
  });

  // Attempt database connection non-blocking so startup is never delayed.
  // Data routes are protected by checkDb middleware which cleanly returns 503 while connecting.
  connectDB().catch((err) => {
    console.error(`[server] MongoDB initial connection error: ${err.message}`);
  });

  initKeepAlive();
}

start();
