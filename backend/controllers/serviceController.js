/**
 * controllers/serviceController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Public endpoints for photography services / investment packages.
 *
 * GET /api/services       → list all published services
 * GET /api/services/:slug → single service package by slug
 */

import Service from "../models/Service.js";

// ── GET /api/services ─────────────────────────────────────────────────────────
export async function getServices(req, res, next) {
  try {
    const services = await Service.find({ isPublished: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    res.json({
      success: true,
      services,
      total: services.length,
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/services/:slug ───────────────────────────────────────────────────
export async function getServiceBySlug(req, res, next) {
  try {
    const service = await Service.findOne({
      slug: req.params.slug,
      isPublished: true,
    }).lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: `Service not found with slug "${req.params.slug}".`,
      });
    }

    res.json({
      success: true,
      service,
    });
  } catch (err) {
    next(err);
  }
}
