/**
 * routes/serviceRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Routing for photography services.
 */

import { Router } from "express";
import { getServices, getServiceBySlug } from "../controllers/serviceController.js";
import { validateGallerySlug } from "../utils/validators.js";
import { mediumCache } from "../middleware/cacheControl.js";

const router = Router();

// GET /api/services
router.get("/", mediumCache, getServices);

// GET /api/services/:slug
router.get("/:slug", mediumCache, validateGallerySlug, getServiceBySlug);

export default router;
