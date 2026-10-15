/**
 * routes/photographerRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Public route for photographer profile information.
 */

import { Router } from "express";
import { getPhotographerProfile } from "../controllers/photographerController.js";

const router = Router();

// GET /api/photographer
router.get("/", getPhotographerProfile);

export default router;
