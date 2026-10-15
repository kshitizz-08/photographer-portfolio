/**
 * routes/galleryRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/galleries          → list all galleries (query: category)
 * GET /api/galleries/:slug    → single gallery by URL slug
 */

import { Router } from "express";
import {
  getGalleries,
  getGalleryBySlug,
} from "../controllers/galleryController.js";
import { runValidation } from "../middleware/validate.js";
import { slugParamValidator } from "../utils/validators.js";

const router = Router();

router.get("/",       getGalleries);
router.get("/:slug",  slugParamValidator, runValidation, getGalleryBySlug);

export default router;
