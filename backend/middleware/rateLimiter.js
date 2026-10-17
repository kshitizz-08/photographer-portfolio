/**
 * middleware/rateLimiter.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Exports pre-configured rate limiters:
 *   generalLimiter  – applied to all /api/* routes
 *   inquiryLimiter  – strict limit on POST /api/inquiries
 *   loginLimiter    – brute-force protection on POST /api/admin/login
 */

import rateLimit from "express-rate-limit";
import env from "../config/env.js";

const limiterDefaults = {
  standardHeaders: true,   // Return RateLimit-* headers (RFC 6585)
  legacyHeaders:   false,  // Disable deprecated X-RateLimit-* headers
  handler(req, res, next, options) {
    res.status(429).json({
      success: false,
      message: options.message || "Too many requests. Please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
    });
  },
};

/** General API rate limiter — relaxed in development, skips health/uptime checks */
export const generalLimiter = rateLimit({
  ...limiterDefaults,
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max:      env.NODE_ENV === "development" ? 10000 : (env.RATE_LIMIT_MAX || 100),
  skip:     (req) => {
    // Exempt uptime monitors and health checks from rate limiting (crucial for UptimeRobot)
    const path = req.path || "";
    const originalUrl = req.originalUrl || req.url || "";
    if (
      path === "/health" ||
      path === "/ping" ||
      originalUrl === "/health" ||
      originalUrl === "/ping" ||
      originalUrl === "/api/health" ||
      originalUrl === "/api/ping" ||
      originalUrl.startsWith("/health") ||
      originalUrl.startsWith("/api/health") ||
      originalUrl.startsWith("/ping") ||
      originalUrl.startsWith("/api/ping")
    ) {
      return true;
    }
    return env.NODE_ENV === "development" && (req.ip === "127.0.0.1" || req.ip === "::1" || req.ip === "::ffff:127.0.0.1");
  },
  message:  "Too many requests from this IP. Please try again later.",
});

/** Strict limiter for the contact/inquiry endpoint — 10 req / 1 hr per IP */
export const inquiryLimiter = rateLimit({
  ...limiterDefaults,
  windowMs: env.INQUIRY_RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000,
  max:      env.NODE_ENV === "development" ? 100 : (env.INQUIRY_RATE_LIMIT_MAX || 10),
  message:  "Too many inquiry submissions. Please wait before submitting again.",
});

/** Brute-force protection for admin login */
export const loginLimiter = rateLimit({
  ...limiterDefaults,
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max:      env.NODE_ENV === "development" ? 100 : (env.LOGIN_RATE_LIMIT_MAX || 5),
  skipSuccessfulRequests: true,
  message:  "Too many failed login attempts. Please wait 15 minutes before trying again.",
});

