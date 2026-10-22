/**
 * routes/photoRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/photos            → list photos (query: category, featured, page, limit)
 * GET /api/photos/featured   → featured photos only (home page use)
 * GET /api/photos/:id        → single photo by MongoDB ObjectId
 */

import { Router } from "express";
import {
  getPhotos,
  getFeaturedPhotos,
  getPhotoById,
} from "../controllers/photoController.js";
import { runValidation } from "../middleware/validate.js";
import { photoQueryValidators } from "../utils/validators.js";
import { shortCache } from "../middleware/cacheControl.js";

const router = Router();

// NOTE: /featured must be registered BEFORE /:id to avoid "featured" being
// treated as a MongoDB ObjectId and triggering a CastError.
router.get("/featured", shortCache, getFeaturedPhotos);
router.get("/",         shortCache, photoQueryValidators, runValidation, getPhotos);
router.get("/:id",      shortCache, getPhotoById);

export default router;
