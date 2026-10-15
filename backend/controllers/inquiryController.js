/**
 * controllers/inquiryController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles photography shoot inquiry submissions from clients.
 *
 * POST /api/inquiries
 * → validates client details, shoot type, date, location, budget, and message
 * → persists to MongoDB
 * → generates a unique reference ID
 * → keeps private notes and sensitive internal state out of the client response
 * → guards against raw database error leakage
 */

import Inquiry from "../models/Inquiry.js";

// ── POST /api/inquiries ───────────────────────────────────────────────────────
export async function createInquiry(req, res) {
  try {
    const {
      name,
      email,
      phone,
      shootType,
      eventType,
      preferredDate,
      eventDate,
      location,
      budget,
      message,
      referenceGallery,
    } = req.body;

    const resolvedShootType = (shootType || eventType || "").trim();
    const resolvedDate = (preferredDate || eventDate || "").trim();

    // Persist inquiry in MongoDB
    const inquiry = await Inquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      shootType: resolvedShootType,
      preferredDate: resolvedDate,
      location: location ? location.trim() : "",
      budget: budget ? budget.trim() : "",
      message: message.trim(),
      referenceGallery: referenceGallery ? referenceGallery.trim() : "",
      status: "new",
      // adminNotes is kept default empty and never set by public client
    });

    // Return reference ID and friendly confirmation without exposing internal data or admin notes
    return res.status(201).json({
      success: true,
      message: "Your inquiry has been received. Elena will be in touch within 48 hours.",
      referenceId: inquiry.referenceId,
      inquiry: {
        referenceId: inquiry.referenceId,
        name: inquiry.name,
        email: inquiry.email,
        shootType: inquiry.shootType,
        preferredDate: inquiry.preferredDate || null,
        location: inquiry.location || null,
        budget: inquiry.budget || null,
        createdAt: inquiry.createdAt,
      },
    });
  } catch (err) {
    console.error("[Inquiry Controller] Error saving inquiry to database:", err.message);

    // Schema validation errors
    if (err.name === "ValidationError") {
      return res.status(422).json({
        success: false,
        message: "Please verify the information provided.",
        errors: Object.values(err.errors).map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }

    // Generic safe error — do not expose private database error traces to visitors
    return res.status(500).json({
      success: false,
      message: "We encountered an issue saving your inquiry. Please try again or reach out directly by email.",
    });
  }
}
