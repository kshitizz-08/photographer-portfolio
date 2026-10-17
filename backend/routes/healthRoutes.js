/**
 * routes/healthRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Public health check and ping routes for uptime monitors (UptimeRobot, etc.)
 */

import { Router } from "express";
import { getHealth, getPing } from "../controllers/healthController.js";

const router = Router();

// GET & HEAD /health or /api/health
router.route("/").get(getHealth).head(getHealth);

// GET & HEAD /health/ping or /api/health/ping
router.route("/ping").get(getPing).head(getPing);

export default router;
