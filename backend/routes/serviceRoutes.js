/**
 * routes/serviceRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Routing for photography services.
 */

import { Router } from "express";
import { getServices, getServiceBySlug } from "../controllers/serviceController.js";
import { validateGallerySlug } from "../utils/validators.js";

const router = Router();

// GET /api/services
router.get("/", getServices);

// GET /api/services/:slug
router.get("/:slug", validateGallerySlug, getServiceBySlug);

export default router;
