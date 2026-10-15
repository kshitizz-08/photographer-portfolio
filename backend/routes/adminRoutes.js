/**
 * routes/adminRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin-only API routes for the photographer's private panel.
 *
 * Auth routes:
 * - POST   /api/admin/login        (rate-limited)
 * - POST   /api/admin/logout       (requires auth)
 * - GET    /api/admin/me           (requires auth)
 *
 * Content management routes (all require auth):
 * - GET    /api/admin/stats
 * - Portfolio: GET, POST, PUT, DELETE, PATCH publish/featured, PUT reorder
 * - Galleries: GET, GET /:id, POST, PUT, DELETE, PATCH publish
 * - Services:  GET, POST, PUT, DELETE, PATCH publish
 * - Inquiries: GET, PATCH /:id, DELETE /:id
 * - Profile:   GET, PUT
 */

import { Router } from "express";
import {
  adminLogin,
  adminLogout,
  getAdminMe,
} from "../controllers/adminAuthController.js";
import {
  getDashboardStats,
  // Portfolio
  getAdminPhotos,
  createAdminPhoto,
  updateAdminPhoto,
  deleteAdminPhoto,
  togglePublishPhoto,
  toggleFeaturedPhoto,
  reorderPhotos,
  // Galleries
  getAdminGalleries,
  getAdminGalleryById,
  createAdminGallery,
  updateAdminGallery,
  deleteAdminGallery,
  togglePublishGallery,
  // Services
  getAdminServices,
  createAdminService,
  updateAdminService,
  deleteAdminService,
  togglePublishService,
  // Inquiries
  getAdminInquiries,
  updateAdminInquiry,
  deleteAdminInquiry,
  // Profile & Settings
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/adminContentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { loginLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public auth routes (rate-limited)
router.post("/login", loginLimiter, adminLogin);

// ── All routes below require valid photographer session cookie ───────────────
router.use(requireAuth);

// Session verification & logout
router.post("/logout", adminLogout);
router.get("/me", getAdminMe);

// 1. Dashboard statistics
router.get("/stats", getDashboardStats);

// 2. Portfolio Management
router.get("/portfolio", getAdminPhotos);
router.post("/portfolio", createAdminPhoto);
router.put("/portfolio/reorder", reorderPhotos);
router.put("/portfolio/:id", updateAdminPhoto);
router.delete("/portfolio/:id", deleteAdminPhoto);
router.patch("/portfolio/:id/publish", togglePublishPhoto);
router.patch("/portfolio/:id/featured", toggleFeaturedPhoto);

// 3. Galleries Management
router.get("/galleries", getAdminGalleries);
router.get("/galleries/:id", getAdminGalleryById);
router.post("/galleries", createAdminGallery);
router.put("/galleries/:id", updateAdminGallery);
router.delete("/galleries/:id", deleteAdminGallery);
router.patch("/galleries/:id/publish", togglePublishGallery);

// 4. Services Management
router.get("/services", getAdminServices);
router.post("/services", createAdminService);
router.put("/services/:id", updateAdminService);
router.delete("/services/:id", deleteAdminService);
router.patch("/services/:id/publish", togglePublishService);

// 5. Inquiries Management
router.get("/inquiries", getAdminInquiries);
router.patch("/inquiries/:id", updateAdminInquiry);
router.delete("/inquiries/:id", deleteAdminInquiry);

// 6. Profile & Settings Management
router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);

export default router;
