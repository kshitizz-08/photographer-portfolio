/**
 * routes/inquiryRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/inquiries   → submit a photography shoot inquiry
 *
 * Rate limited by inquiryLimiter (10 requests / hour per IP).
 */

import { Router } from "express";
import { createInquiry } from "../controllers/inquiryController.js";
import { runValidation } from "../middleware/validate.js";
import { inquiryValidators } from "../utils/validators.js";
import { inquiryLimiter } from "../middleware/rateLimiter.js";
import { noCache } from "../middleware/cacheControl.js";

const router = Router();

router.post(
  "/",
  noCache,
  inquiryLimiter,        // strict rate limit — applied first
  inquiryValidators,     // field validation rules
  runValidation,         // abort on validation errors
  createInquiry          // persist and respond
);

export default router;
