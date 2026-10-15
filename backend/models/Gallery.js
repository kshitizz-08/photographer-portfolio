/**
 * models/Gallery.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mongoose model for curated photography shoot galleries.
 * Supports:
 * - title, unique slug, description, coverImage, image references, publication status
 * - Referenced images (ObjectId ref to PortfolioImage)
 * - Embedded photos fallback for flexible multi-image galleries
 * - Schema validation, timestamps, and indexes
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose;

const GalleryEmbeddedPhotoSchema = new Schema(
  {
    src: { type: String, required: true, trim: true },
    alt: { type: String, required: true, trim: true, maxlength: 300 },
    aspect: {
      type: String,
      enum: ["portrait", "landscape", "square", "tall"],
      default: "portrait",
    },
  },
  { _id: true }
);

const GallerySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Gallery title is required."],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters."],
    },
    slug: {
      type: String,
      required: [true, "Unique slug is required."],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens."],
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters."],
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
      enum: {
        values: ["Wedding", "Pre-Wedding", "Portrait", "Events", "Fashion", "Travel"],
        message: "{VALUE} is not a valid category.",
      },
      index: true,
    },
    coverImage: {
      imageUrl: { type: String, required: true, trim: true, alias: "src" },
      altText:  { type: String, required: true, trim: true, alias: "alt" },
      aspect:   { type: String, default: "portrait" },
    },
    // Image references to PortfolioImage collection
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: "PortfolioImage",
      },
    ],
    // Embedded photos fallback/support for direct inline sets
    photos: {
      type: [GalleryEmbeddedPhotoSchema],
      default: [],
    },
    location: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
      min: 2000,
      max: 2100,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
      alias: "published",
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
      alias: "order",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

GallerySchema.index({ category: 1, isPublished: 1 });
GallerySchema.index({ isPublished: 1, sortOrder: 1, createdAt: -1 });

const Gallery = model("Gallery", GallerySchema);

export default Gallery;
