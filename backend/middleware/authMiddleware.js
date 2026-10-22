/**
 * middleware/authMiddleware.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Protects private admin endpoints by verifying HTTP-only session cookies
 * or Authorization Bearer tokens.
 */

import jwt from "jsonwebtoken";
import env from "../config/env.js";
import Photographer from "../models/Photographer.js";

export async function requireAuth(req, res, next) {
  try {
    // 1. Check HTTP-only cookie first, then fallback to Authorization header
    const token =
      req.cookies?.[env.ADMIN_COOKIE_NAME] ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in to access the admin panel.",
        code: "UNAUTHORIZED",
      });
    }

    // 2. Verify token signature and expiration
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 3. Look up authorized photographer account
    const photographer = await Photographer.findById(decoded.id)
      .select("name email title role avatar")
      .lean();

    if (!photographer) {
      return res.status(401).json({
        success: false,
        message: "Authorized account no longer exists. Please re-authenticate.",
        code: "ACCOUNT_NOT_FOUND",
      });
    }

    // 4. Attach verified photographer to request object
    req.photographer = photographer;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid session token. Please log in again.",
      code: "INVALID_TOKEN",
    });
  }
}
