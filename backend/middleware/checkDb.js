/**
 * middleware/checkDb.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Middleware ensuring MongoDB is connected before handling data-dependent requests.
 * If MongoDB is not connected, returns 503 with a clear explanation of what is missing.
 */

import mongoose from "mongoose";

export default function checkDb(req, res, next) {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database is not connected. Please ensure MONGODB_URI is configured in backend/.env and MongoDB Atlas IP access is allowed.",
      code: "DATABASE_UNAVAILABLE",
    });
  }
  next();
}
