/**
 * routes/photographerRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Public route for photographer profile information.
 */

import { Router } from "express";
import { getPhotographerProfile } from "../controllers/photographerController.js";
import { noCache } from "../middleware/cacheControl.js";

const router = Router();

// GET /api/photographer — always return fresh profile from database
router.get("/", noCache, getPhotographerProfile);

export default router;
