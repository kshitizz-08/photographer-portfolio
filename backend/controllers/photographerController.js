/**
 * controllers/photographerController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Public endpoints for photographer profile and editorial bio.
 *
 * GET /api/photographer → returns public profile (guarantees passwords and private notes are omitted)
 */

import Photographer from "../models/Photographer.js";

// ── GET /api/photographer ─────────────────────────────────────────────────────
export async function getPhotographerProfile(req, res, next) {
  try {
    // Queries without password and private notes (both are already select: false)
    const profile = await Photographer.findOne()
      .sort({ updatedAt: -1 })
      .select("-password -privateNotes -__v")
      .lean();

    if (!profile) {
      // Return a graceful default placeholder if not yet seeded
      return res.json({
        success: true,
        photographer: {
          name: "Elena Vasquez",
          title: "Fine Art & Editorial Photographer",
          bio: "Specializing in documentary-style weddings, intimate portraits, and timeless editorial photography.",
          heroHeading: "Capturing Moments That Last Forever.",
          location: "San Francisco, CA & Worldwide",
          socialLinks: {
            instagram: "https://instagram.com",
            facebook: "https://facebook.com",
            pinterest: "https://pinterest.com",
            twitter: "https://twitter.com",
          },
        },
      });
    }

    res.json({
      success: true,
      photographer: profile,
    });
  } catch (err) {
    next(err);
  }
}
