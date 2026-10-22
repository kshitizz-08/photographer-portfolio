/**
 * controllers/adminContentController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Controller handling all authenticated administrative operations:
 * - Dashboard analytics and counts
 * - Portfolio photo CRUD, toggles, reordering
 * - Gallery CRUD, toggles, photo linking
 * - Service package CRUD and publication toggles
 * - Client inquiry management (search, filter, status, private notes, deletion)
 * - Photographer profile & settings management
 */

import PortfolioImage from "../models/PortfolioImage.js";
import Gallery from "../models/Gallery.js";
import Service from "../models/Service.js";
import Inquiry from "../models/Inquiry.js";
import Photographer from "../models/Photographer.js";

// Helper: safe slug generator
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "") || "untitled";
}

async function getUniqueSlug(Model, baseTitle, currentId = null) {
  let base = slugify(baseTitle);
  let slug = base;
  let counter = 1;
  while (true) {
    const query = { slug };
    if (currentId) query._id = { $ne: currentId };
    const exists = await Model.exists(query);
    if (!exists) return slug;
    slug = `${base}-${counter}`;
    counter++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DASHBOARD ANALYTICS & STATS
// ─────────────────────────────────────────────────────────────────────────────
export async function getDashboardStats(req, res, next) {
  try {
    const [
      totalPhotos,
      publishedPhotos,
      featuredPhotos,
      totalGalleries,
      publishedGalleries,
      totalServices,
      publishedServices,
      inquiriesTotal,
      newInquiries,
      recentInquiries,
      recentPhotos,
      categoryCounts,
    ] = await Promise.all([
      PortfolioImage.countDocuments(),
      PortfolioImage.countDocuments({ isPublished: true }),
      PortfolioImage.countDocuments({ isFeatured: true }),
      Gallery.countDocuments(),
      Gallery.countDocuments({ isPublished: true }),
      Service.countDocuments(),
      Service.countDocuments({ isPublished: true }),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: "new" }),
      Inquiry.find().select("+adminNotes").sort({ createdAt: -1 }).limit(5).lean(),
      PortfolioImage.find().select("title imageUrl aspect category isPublished isFeatured createdAt").sort({ createdAt: -1 }).limit(6).lean(),
      PortfolioImage.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        photos: {
          total: totalPhotos,
          published: publishedPhotos,
          featured: featuredPhotos,
        },
        galleries: {
          total: totalGalleries,
          published: publishedGalleries,
        },
        services: {
          total: totalServices,
          published: publishedServices,
        },
        inquiries: {
          total: inquiriesTotal,
          new: newInquiries,
        },
      },
      categoryCounts,
      recentInquiries,
      recentPhotos,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PORTFOLIO MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
export async function getAdminPhotos(req, res, next) {
  try {
    const { category, search, featured, published, page, limit } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }
    if (featured !== undefined) {
      filter.isFeatured = featured === "true";
    }
    if (published !== undefined) {
      filter.isPublished = published === "true";
    }
    if (search && search.trim()) {
      filter.title = { $regex: search.trim(), $options: "i" };
    }

    const pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : null;
    const limitNum = limit ? Math.min(200, Math.max(1, parseInt(limit, 10) || 50)) : null;

    let query = PortfolioImage.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 });

    if (pageNum && limitNum) {
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const [photos, total] = await Promise.all([
      query.lean(),
      PortfolioImage.countDocuments(filter),
    ]);

    const normalized = photos.map((p) => ({
      ...p,
      src: p.imageUrl || p.src,
      alt: p.altText || p.alt,
      featured: p.isFeatured ?? p.featured,
      published: p.isPublished ?? p.published,
      order: p.sortOrder ?? p.order,
    }));

    res.json({
      success: true,
      photos: normalized,
      total,
      page: pageNum || 1,
      pages: limitNum ? Math.ceil(total / limitNum) : 1,
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminPhoto(req, res, next) {
  try {
    const {
      title,
      description,
      imageUrl,
      src,
      category,
      altText,
      alt,
      isFeatured,
      isPublished,
      aspect,
      location,
      year,
      sortOrder,
    } = req.body;

    const resolvedUrl = (imageUrl || src || "").trim();
    const resolvedAlt = (altText || alt || title || "").trim();

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required." });
    }
    if (!resolvedUrl) {
      return res.status(400).json({ success: false, message: "Image URL is required." });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required." });
    }

    // Determine default order if not provided
    let orderVal = Number(sortOrder);
    if (isNaN(orderVal)) {
      const highest = await PortfolioImage.findOne().sort({ sortOrder: -1 }).select("sortOrder").lean();
      orderVal = highest ? (highest.sortOrder || 0) + 1 : 0;
    }

    const photo = await PortfolioImage.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      imageUrl: resolvedUrl,
      category,
      altText: resolvedAlt,
      isFeatured: Boolean(isFeatured),
      isPublished: isPublished !== false,
      aspect: aspect || "portrait",
      location: location ? location.trim() : "",
      year: year ? Number(year) : new Date().getFullYear(),
      sortOrder: orderVal,
    });

    res.status(201).json({
      success: true,
      message: "Photograph added to portfolio successfully.",
      photo,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminPhoto(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      imageUrl,
      src,
      category,
      altText,
      alt,
      isFeatured,
      isPublished,
      aspect,
      location,
      year,
      sortOrder,
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (imageUrl || src) updateData.imageUrl = (imageUrl || src).trim();
    if (category !== undefined) updateData.category = category;
    if (altText || alt) updateData.altText = (altText || alt).trim();
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);
    if (aspect !== undefined) updateData.aspect = aspect;
    if (location !== undefined) updateData.location = location ? location.trim() : "";
    if (year !== undefined) updateData.year = year ? Number(year) : undefined;
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

    const updated = await PortfolioImage.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Photo not found." });
    }

    res.json({
      success: true,
      message: "Photograph updated successfully.",
      photo: {
        ...updated,
        src: updated.imageUrl,
        alt: updated.altText,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminPhoto(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await PortfolioImage.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Photo not found." });
    }

    // Clean up references in galleries
    await Gallery.updateMany({ images: id }, { $pull: { images: id } });

    res.json({ success: true, message: "Photograph deleted from portfolio." });
  } catch (err) {
    next(err);
  }
}

export async function togglePublishPhoto(req, res, next) {
  try {
    const { id } = req.params;
    const photo = await PortfolioImage.findById(id).select("isPublished");
    if (!photo) {
      return res.status(404).json({ success: false, message: "Photo not found." });
    }

    const newStatus = !photo.isPublished;
    await PortfolioImage.updateOne({ _id: id }, { $set: { isPublished: newStatus } });

    res.json({
      success: true,
      message: `Photograph ${newStatus ? "published" : "unpublished"}.`,
      isPublished: newStatus,
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleFeaturedPhoto(req, res, next) {
  try {
    const { id } = req.params;
    const photo = await PortfolioImage.findById(id).select("isFeatured");
    if (!photo) {
      return res.status(404).json({ success: false, message: "Photo not found." });
    }

    const newStatus = !photo.isFeatured;
    await PortfolioImage.updateOne({ _id: id }, { $set: { isFeatured: newStatus } });

    res.json({
      success: true,
      message: `Photograph ${newStatus ? "marked as featured" : "removed from featured"}.`,
      isFeatured: newStatus,
    });
  } catch (err) {
    next(err);
  }
}

export async function reorderPhotos(req, res, next) {
  try {
    const { photoIds } = req.body;
    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({ success: false, message: "photoIds array is required." });
    }

    const bulkOps = photoIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { sortOrder: index } },
      },
    }));

    await PortfolioImage.bulkWrite(bulkOps, { ordered: false });

    res.json({ success: true, message: "Photos reordered successfully." });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GALLERY MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
export async function getAdminGalleries(req, res, next) {
  try {
    const { page, limit } = req.query;
    const pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : null;
    const limitNum = limit ? Math.min(200, Math.max(1, parseInt(limit, 10) || 50)) : null;

    let query = Gallery.find().sort({ sortOrder: 1, createdAt: -1 });
    if (pageNum && limitNum) {
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const [galleries, total] = await Promise.all([
      query.lean(),
      Gallery.countDocuments(),
    ]);

    res.json({
      success: true,
      galleries,
      total,
      page: pageNum || 1,
      pages: limitNum ? Math.ceil(total / limitNum) : 1,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminGalleryById(req, res, next) {
  try {
    const gallery = await Gallery.findById(req.params.id)
      .populate("images")
      .lean();

    if (!gallery) {
      return res.status(404).json({ success: false, message: "Gallery not found." });
    }

    res.json({ success: true, gallery });
  } catch (err) {
    next(err);
  }
}

export async function createAdminGallery(req, res, next) {
  try {
    const {
      title,
      slug,
      subtitle,
      description,
      category,
      coverImage,
      images,
      photos,
      location,
      year,
      isPublished,
      sortOrder,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Gallery title is required." });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required." });
    }
    if (!coverImage?.imageUrl && !coverImage?.src) {
      return res.status(400).json({ success: false, message: "Cover image is required." });
    }

    const resolvedSlug = slug
      ? await getUniqueSlug(Gallery, slug)
      : await getUniqueSlug(Gallery, title);

    const gallery = await Gallery.create({
      title: title.trim(),
      slug: resolvedSlug,
      subtitle: subtitle ? subtitle.trim() : "",
      description: description ? description.trim() : "",
      category,
      coverImage: {
        imageUrl: (coverImage.imageUrl || coverImage.src).trim(),
        altText: (coverImage.altText || coverImage.alt || title).trim(),
        aspect: coverImage.aspect || "portrait",
      },
      images: Array.isArray(images) ? images : [],
      photos: Array.isArray(photos) ? photos : [],
      location: location ? location.trim() : "",
      year: year ? Number(year) : new Date().getFullYear(),
      isPublished: isPublished !== false,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
    });

    const populated = await Gallery.findById(gallery._id).populate("images").lean();

    res.status(201).json({
      success: true,
      message: "Gallery created successfully.",
      gallery: populated,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminGallery(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      subtitle,
      description,
      category,
      coverImage,
      images,
      photos,
      location,
      year,
      isPublished,
      sortOrder,
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (subtitle !== undefined) updateData.subtitle = subtitle.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (location !== undefined) updateData.location = location.trim();
    if (year !== undefined) updateData.year = Number(year);
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);
    if (images !== undefined) updateData.images = Array.isArray(images) ? images : [];
    if (photos !== undefined) updateData.photos = Array.isArray(photos) ? photos : [];

    if (coverImage) {
      updateData.coverImage = {
        imageUrl: (coverImage.imageUrl || coverImage.src || "").trim(),
        altText: (coverImage.altText || coverImage.alt || title || "").trim(),
        aspect: coverImage.aspect || "portrait",
      };
    }

    if (slug) {
      updateData.slug = await getUniqueSlug(Gallery, slug, id);
    }

    const updated = await Gallery.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    }).populate("images").lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Gallery not found." });
    }

    res.json({
      success: true,
      message: "Gallery updated successfully.",
      gallery: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminGallery(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Gallery.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Gallery not found." });
    }

    res.json({ success: true, message: "Gallery deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function togglePublishGallery(req, res, next) {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findById(id).select("isPublished");
    if (!gallery) {
      return res.status(404).json({ success: false, message: "Gallery not found." });
    }

    const newStatus = !gallery.isPublished;
    await Gallery.updateOne({ _id: id }, { $set: { isPublished: newStatus } });

    res.json({
      success: true,
      message: `Gallery ${newStatus ? "published" : "unpublished"}.`,
      isPublished: newStatus,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SERVICES MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
export async function getAdminServices(req, res, next) {
  try {
    const services = await Service.find()
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    res.json({ success: true, services, total: services.length });
  } catch (err) {
    next(err);
  }
}

export async function createAdminService(req, res, next) {
  try {
    const {
      name,
      slug,
      description,
      startingPrice,
      currency,
      coverImage,
      features,
      deliverables,
      isPublished,
      sortOrder,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Service name is required." });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description is required." });
    }

    const resolvedSlug = slug
      ? await getUniqueSlug(Service, slug)
      : await getUniqueSlug(Service, name);

    const service = await Service.create({
      name: name.trim(),
      slug: resolvedSlug,
      description: description.trim(),
      startingPrice: startingPrice !== undefined && startingPrice !== "" ? Number(startingPrice) : null,
      currency: currency || "INR",
      coverImage: {
        imageUrl: (coverImage?.imageUrl || coverImage?.src || "").trim(),
        altText: (coverImage?.altText || coverImage?.alt || name).trim(),
      },
      features: Array.isArray(features)
        ? features.filter((f) => typeof f === "string" && f.trim())
        : (typeof features === "string" ? features.split("\n").map(s => s.trim()).filter(Boolean) : []),
      deliverables: deliverables ? deliverables.trim() : "",
      isPublished: isPublished !== false,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully.",
      service,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminService(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      startingPrice,
      currency,
      coverImage,
      features,
      deliverables,
      isPublished,
      sortOrder,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (startingPrice !== undefined) {
      updateData.startingPrice = startingPrice !== "" && startingPrice !== null ? Number(startingPrice) : null;
    }
    if (currency !== undefined) updateData.currency = currency;
    if (deliverables !== undefined) updateData.deliverables = deliverables.trim();
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

    if (coverImage) {
      updateData.coverImage = {
        imageUrl: (coverImage.imageUrl || coverImage.src || "").trim(),
        altText: (coverImage.altText || coverImage.alt || name || "").trim(),
      };
    }

    if (features !== undefined) {
      updateData.features = Array.isArray(features)
        ? features.filter((f) => typeof f === "string" && f.trim())
        : (typeof features === "string" ? features.split("\n").map(s => s.trim()).filter(Boolean) : []);
    }

    if (slug) {
      updateData.slug = await getUniqueSlug(Service, slug, id);
    }

    const updated = await Service.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    res.json({
      success: true,
      message: "Service updated successfully.",
      service: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminService(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Service.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    res.json({ success: true, message: "Service deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function togglePublishService(req, res, next) {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).select("isPublished");
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    const newStatus = !service.isPublished;
    await Service.updateOne({ _id: id }, { $set: { isPublished: newStatus } });

    res.json({
      success: true,
      message: `Service ${newStatus ? "published" : "unpublished"}.`,
      isPublished: newStatus,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. INQUIRIES MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
export async function getAdminInquiries(req, res, next) {
  try {
    const { status, search, page, limit } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { shootType: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { message: { $regex: q, $options: "i" } },
        { referenceId: { $regex: q, $options: "i" } },
      ];
    }

    const pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : null;
    const limitNum = limit ? Math.min(200, Math.max(1, parseInt(limit, 10) || 50)) : null;

    let query = Inquiry.find(filter)
      .select("+adminNotes")
      .sort({ createdAt: -1 });

    if (pageNum && limitNum) {
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const [inquiries, total] = await Promise.all([
      query.lean(),
      Inquiry.countDocuments(filter),
    ]);

    res.json({
      success: true,
      inquiries,
      total,
      page: pageNum || 1,
      pages: limitNum ? Math.ceil(total / limitNum) : 1,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminInquiry(req, res, next) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

    const updated = await Inquiry.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { returnDocument: "after", runValidators: true }
    )
      .select("+adminNotes")
      .lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Inquiry not found." });
    }

    res.json({
      success: true,
      message: "Inquiry updated successfully.",
      inquiry: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminInquiry(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Inquiry.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Inquiry not found." });
    }

    res.json({ success: true, message: "Inquiry deleted successfully." });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SETTINGS & PROFILE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
export async function getAdminProfile(req, res, next) {
  try {
    // Return full photographer profile with privateNotes
    let photographer = await Photographer.findById(req.photographer._id)
      .select("+privateNotes")
      .lean();

    if (!photographer) {
      photographer = await Photographer.findOne().select("+privateNotes").lean();
    }

    if (!photographer) {
      return res.status(404).json({ success: false, message: "Photographer profile not found." });
    }

    res.json({ success: true, profile: photographer });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminProfile(req, res, next) {
  try {
    const {
      name,
      title,
      email,
      bio,
      shortBio,
      profileImage,
      heroImage,
      heroHeading,
      heroSubheading,
      location,
      phone,
      socialLinks,
      stats,
      privateNotes,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (title !== undefined) updateData.title = title.trim();
    if (email !== undefined && email.trim()) updateData.email = email.trim().toLowerCase();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (shortBio !== undefined) updateData.shortBio = shortBio.trim();
    if (heroImage !== undefined) updateData.heroImage = typeof heroImage === "string" ? heroImage.trim() : (heroImage?.imageUrl || heroImage?.src || "").trim();
    if (heroHeading !== undefined) updateData.heroHeading = heroHeading.trim();
    if (heroSubheading !== undefined) updateData.heroSubheading = heroSubheading.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (privateNotes !== undefined) updateData.privateNotes = privateNotes;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (stats !== undefined && Array.isArray(stats)) updateData.stats = stats;

    if (profileImage) {
      updateData.profileImage = {
        imageUrl: (profileImage.imageUrl || profileImage.src || "").trim(),
        altText: (profileImage.altText || profileImage.alt || name || "").trim(),
      };
    }

    let updated = await Photographer.findByIdAndUpdate(
      req.photographer._id,
      { $set: updateData },
      { returnDocument: "after", runValidators: true }
    )
      .select("+privateNotes")
      .lean();

    if (!updated) {
      updated = await Photographer.findOneAndUpdate(
        {},
        { $set: updateData },
        { returnDocument: "after", runValidators: true }
      )
        .select("+privateNotes")
        .lean();
    }

    res.json({
      success: true,
      message: "Profile updated successfully.",
      profile: updated,
    });
  } catch (err) {
    next(err);
  }
}
