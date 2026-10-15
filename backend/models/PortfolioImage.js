/**
 * models/PortfolioImage.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mongoose model for individual portfolio photographs.
 * Supports:
 * - title, description, imageUrl, category, altText, isFeatured, isPublished, sortOrder
 * - Virtual aliases (src, alt, featured, published, order) for backwards compatibility
 * - Schema validation, timestamps, and performance query indexes
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose;

const PortfolioImageSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Image title is required."],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters."],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Description cannot exceed 1000 characters."],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required."],
      trim: true,
      alias: "src", // allows doc.src or doc.imageUrl interchangeably
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
    altText: {
      type: String,
      required: [true, "Alt text is required for accessibility."],
      trim: true,
      maxlength: [300, "Alt text cannot exceed 300 characters."],
      alias: "alt",
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
      alias: "featured",
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
    // Layout and editorial metadata
    aspect: {
      type: String,
      enum: ["portrait", "landscape", "square", "tall"],
      default: "portrait",
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for optimized query performance
PortfolioImageSchema.index({ category: 1, isPublished: 1 });
PortfolioImageSchema.index({ isFeatured: 1, isPublished: 1 });
PortfolioImageSchema.index({ isPublished: 1, sortOrder: 1, createdAt: -1 });

const PortfolioImage = model("PortfolioImage", PortfolioImageSchema);

export default PortfolioImage;
