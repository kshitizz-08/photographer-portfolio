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

// ── 6. General rate limiter (all /api routes) ─────────────────────────────────
app.use("/api", generalLimiter);

// ── 7. API routes ─────────────────────────────────────────────────────────────
app.use("/api", apiRouter);

// ── 8. Root ping (non-API) ────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Photography Portfolio API",
    docs:    "/api/health",
    version: "1.0.0",
  });
});

// ── 9. 404 handler ────────────────────────────────────────────────────────────
app.use(notFound);

// ── 10. Centralized error handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── 11. Start server ──────────────────────────────────────────────────────────
async function start() {
  await connectDB();

  app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`\n[server] Running in ${env.NODE_ENV} mode`);
    console.log(`[server] Listening on port ${env.PORT}`);
    console.log(`[server] Health check → /api/health\n`);
  });
}

start();
