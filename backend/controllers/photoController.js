/**
 * controllers/photoController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles requests for portfolio photographs.
 *
 * GET /api/photos          → list photos (filterable by category, featured, paginated)
 * GET /api/photos/featured → list featured photos (home page)
 * GET /api/photos/:id      → single photo by MongoDB _id
 */

import PortfolioImage from "../models/PortfolioImage.js";

// ── Helper: standard paginated query ─────────────────────────────────────────
async function paginatedFind(filter, { page = 1, limit = 50, sort = { sortOrder: 1, createdAt: -1 } }) {
  const skip = (page - 1) * limit;
  const total = await PortfolioImage.countDocuments(filter);
  const photos = await PortfolioImage.find(filter).sort(sort).skip(skip).limit(limit).lean();

  // Normalize fields so clients receive both src and imageUrl, alt and altText
  const normalized = photos.map((p) => ({
    ...p,
    src: p.imageUrl || p.src,
    alt: p.altText || p.alt,
    featured: p.isFeatured ?? p.featured,
    published: p.isPublished ?? p.published,
    order: p.sortOrder ?? p.order,
  }));

  return { photos: normalized, total, page, pages: Math.ceil(total / limit) };
}

// ── GET /api/photos ───────────────────────────────────────────────────────────
export async function getPhotos(req, res, next) {
  try {
    const { category, featured, limit = 50, page = 1 } = req.query;

    const filter = { isPublished: { $ne: false } };
    if (category) filter.category = category;
    if (featured !== undefined) filter.isFeatured = featured === "true";

    const result = await paginatedFind(filter, {
      page: Number(page),
      limit: Math.min(Number(limit), 100),
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/photos/featured ──────────────────────────────────────────────────
export async function getFeaturedPhotos(req, res, next) {
  try {
    const rawPhotos = await PortfolioImage.find({
      isPublished: { $ne: false },
      isFeatured: true,
    })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(12)
      .lean();

    const photos = rawPhotos.map((p) => ({
      ...p,
      src: p.imageUrl || p.src,
      alt: p.altText || p.alt,
      featured: p.isFeatured ?? p.featured,
      published: p.isPublished ?? p.published,
      order: p.sortOrder ?? p.order,
    }));

    res.json({ success: true, photos, total: photos.length });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/photos/:id ───────────────────────────────────────────────────────
export async function getPhotoById(req, res, next) {
  try {
    const photo = await PortfolioImage.findOne({
      _id: req.params.id,
      isPublished: { $ne: false },
    }).lean();

    if (!photo) {
      return res.status(404).json({ success: false, message: "Photo not found." });
    }

    const normalized = {
      ...photo,
      src: photo.imageUrl || photo.src,
      alt: photo.altText || photo.alt,
      featured: photo.isFeatured ?? photo.featured,
      published: photo.isPublished ?? photo.published,
      order: photo.sortOrder ?? photo.order,
    };

    res.json({ success: true, photo: normalized });
  } catch (err) {
    next(err);
  }
}
