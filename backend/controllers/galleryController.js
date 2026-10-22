/**
 * controllers/galleryController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles requests for curated gallery collections.
 *
 * GET /api/galleries           → list all galleries (filterable by category)
 * GET /api/galleries/:slug     → single gallery by URL slug
 */

import Gallery from "../models/Gallery.js";

// ── GET /api/galleries ────────────────────────────────────────────────────────
export async function getGalleries(req, res, next) {
  try {
    const { category } = req.query;
    const filter = { isPublished: { $ne: false } };
    if (category) filter.category = category;

    const galleries = await Gallery.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .select("-photos -images -__v")
      .lean();

    res.json({ success: true, galleries, total: galleries.length });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/galleries/:slug ──────────────────────────────────────────────────
export async function getGalleryBySlug(req, res, next) {
  try {
    const gallery = await Gallery.findOne({
      slug: req.params.slug,
      isPublished: { $ne: false },
    })
      .select("-__v")
      .populate({
        path: "images",
        match: { isPublished: { $ne: false } },
        select: "imageUrl altText aspect location year title",
      })
      .lean();

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: `No gallery found with slug "${req.params.slug}".`,
      });
    }

    // Combine referenced images and embedded photos for client consumption
    const resolvedPhotos = [
      ...(gallery.photos || []),
      ...((gallery.images || []).map((img) => ({
        id: img._id,
        src: img.imageUrl || img.src,
        alt: img.altText || img.alt,
        aspect: img.aspect || "portrait",
      }))),
    ];

    res.json({
      success: true,
      gallery: {
        ...gallery,
        photos: resolvedPhotos,
      },
    });
  } catch (err) {
    next(err);
  }
}
