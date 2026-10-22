/**
 * routes/photographerRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Public route for photographer profile information.
 */

import { Router } from "express";
import { getPhotographerProfile } from "../controllers/photographerController.js";
import { mediumCache } from "../middleware/cacheControl.js";

const router = Router();

// GET /api/photographer
router.get("/", mediumCache, getPhotographerProfile);

export default router;
