/**
 * controllers/adminAuthController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Photographer private admin authentication:
 * - POST /api/admin/login   (rate limited, verifies bcrypt password, sets HTTP-only cookie)
 * - POST /api/admin/logout  (clears HTTP-only session cookie)
 * - GET  /api/admin/me      (returns current authenticated photographer session)
 */

import jwt from "jsonwebtoken";
import Photographer from "../models/Photographer.js";
import env from "../config/env.js";

// Cookie options helper
function getCookieOptions() {
  const isProduction = env.NODE_ENV === "production";
  return {
    httpOnly: true,                             // prevent client-side JS / XSS access
    secure:   isProduction,                     // HTTPS only in production (required for sameSite: "none")
    sameSite: isProduction ? "none" : "lax",    // "none" allows cross-domain cookies on Render; "lax" for localhost dev
    path:     "/",                              // Session cookie: destroyed when browser session ends
  };
}

// ── POST /api/admin/login ─────────────────────────────────────────────────────
export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const inputEmail = email.trim().toLowerCase();

    // Fetch photographer with password field specifically selected
    let photographer = await Photographer.findOne({
      email: inputEmail,
    }).select("+password");

    // Fallback: If not found by exact email, allow photographer admin alias (admin@emoharmony.com / hello@elenavasquez.com)
    if (!photographer && (inputEmail === "admin@emoharmony.com" || inputEmail === "hello@elenavasquez.com")) {
      photographer = await Photographer.findOne().select("+password");
    }

    // Generic error to avoid account enumeration
    if (!photographer || !photographer.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await photographer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate secure session token
    const token = jwt.sign(
      {
        id: photographer._id,
        email: photographer.email,
        role: "admin",
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set secure HTTP-only cookie
    res.cookie(env.ADMIN_COOKIE_NAME, token, getCookieOptions());

    // Never return password, hashes, or private notes in response
    return res.status(200).json({
      success: true,
      token, // Enables fallback Authorization Bearer header if browser blocks cross-domain cookies
      message: `Welcome back, ${photographer.name}.`,
      photographer: {
        id: photographer._id,
        name: photographer.name,
        email: photographer.email,
        title: photographer.title,
      },
    });
  } catch (err) {
    console.error("[Admin Login Error]:", err.message);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred during login. Please try again.",
    });
  }
}

// ── POST /api/admin/logout ────────────────────────────────────────────────────
export async function adminLogout(req, res) {
  try {
    res.clearCookie(env.ADMIN_COOKIE_NAME, {
      ...getCookieOptions(),
      maxAge: 0,
    });

    return res.status(200).json({
      success: true,
      message: "Successfully logged out.",
    });
  } catch (err) {
    console.error("[Admin Logout Error]:", err.message);
    return res.status(500).json({
      success: false,
      message: "Logout encountered an error.",
    });
  }
}

// ── GET /api/admin/me ─────────────────────────────────────────────────────────
export async function getAdminMe(req, res) {
  // req.photographer was attached by requireAuth middleware
  return res.status(200).json({
    success: true,
    authenticated: true,
    photographer: req.photographer,
  });
}
