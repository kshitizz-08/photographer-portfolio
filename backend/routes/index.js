/**
 * routes/index.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Root API router — mounts all feature routers under /api/*.
 * Endpoints implemented:
 * - GET  /api/health
 * - GET  /api/portfolio
 * - GET  /api/portfolio/featured
 * - GET  /api/portfolio/:id
 * - GET  /api/galleries
 * - GET  /api/galleries/:slug
 * - GET  /api/services
 * - GET  /api/photographer
 * - POST /api/inquiries
 * - POST /api/admin/login
 * - POST /api/admin/logout
 * - GET  /api/admin/me
 */

import { Router } from "express";
import healthRoutes       from "./healthRoutes.js";
import photoRoutes        from "./photoRoutes.js";
import galleryRoutes      from "./galleryRoutes.js";
import serviceRoutes      from "./serviceRoutes.js";
import photographerRoutes from "./photographerRoutes.js";
import inquiryRoutes      from "./inquiryRoutes.js";
import adminRoutes        from "./adminRoutes.js";
import checkDb            from "../middleware/checkDb.js";
import { requestTimeout } from "../middleware/timeout.js";

import { getPing }        from "../controllers/healthController.js";

const router = Router();

// Health check & ping do not require active DB (for monitoring and keep-alive)
router.use("/health", healthRoutes);
router.route("/ping").get(getPing).head(getPing);

// Enforce request timeout across data routes (15 seconds)
router.use(requestTimeout(15000));

// Data-dependent public routes
router.use("/portfolio",    checkDb, photoRoutes);
router.use("/photos",       checkDb, photoRoutes); // alias for backwards compatibility
router.use("/galleries",    checkDb, galleryRoutes);
router.use("/services",     checkDb, serviceRoutes);
router.use("/photographer", checkDb, photographerRoutes);
router.use("/inquiries",    checkDb, inquiryRoutes);

// Admin auth routes (login requires DB; logout/me only need the JWT cookie)
router.use("/admin", checkDb, adminRoutes);

export default router;
