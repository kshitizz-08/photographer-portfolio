/**
 * utils/validators.js
 * ─────────────────────────────────────────────────────────────────────────────
 * express-validator rule arrays used by route files.
 * Keeping rules here (not inline in routes) keeps route files readable.
 */

import { body, param, query } from "express-validator";

// ── Inquiry submission ───────────────────────────────────────────────────────
export const inquiryValidators = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ max: 120 })
    .withMessage("Name must be 120 characters or fewer."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 30 })
    .withMessage("Phone must be 30 characters or fewer."),

  body(["shootType", "eventType"])
    .custom((value, { req }) => {
      const type = req.body.shootType || req.body.eventType;
      if (!type || !type.trim()) {
        throw new Error("Shoot/session type is required.");
      }
      return true;
    }),

  body(["preferredDate", "eventDate"])
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Date must be 50 characters or fewer."),

  body("location")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Location must be 200 characters or fewer."),

  body("budget")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Budget must be 50 characters or fewer."),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required.")
    .isLength({ max: 3000 })
    .withMessage("Message must be 3000 characters or fewer."),

  body("referenceGallery")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Reference gallery slug must be 100 characters or fewer."),
];

// ── Photo list query params ──────────────────────────────────────────────────
export const photoQueryValidators = [
  query("category")
    .optional()
    .trim()
    .isIn(["Wedding", "Pre-Wedding", "Portrait", "Events", "Fashion", "Travel"])
    .withMessage("Invalid category value."),

  query("featured")
    .optional()
    .isBoolean({ strict: false })
    .withMessage("featured must be true or false."),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be an integer between 1 and 100.")
    .toInt(),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer.")
    .toInt(),
];

// ── Gallery slug param ───────────────────────────────────────────────────────
export const slugParamValidator = [
  param("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug parameter is required.")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("Slug must be lowercase letters, numbers, and hyphens only."),
];

export const validateGallerySlug = slugParamValidator;
