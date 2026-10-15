/**
 * models/Service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mongoose model for photography services / packages.
 * Supports:
 * - name, slug, description, optional starting price, cover image, publication status
 * - Schema validation, timestamps, and indexes
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ServiceSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required."],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters."],
    },
    slug: {
      type: String,
      required: [true, "Service slug is required."],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens."],
    },
    description: {
      type: String,
      required: [true, "Service description is required."],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters."],
    },
    startingPrice: {
      type: Number,
      min: [0, "Starting price cannot be negative."],
      default: null,
    },
    currency: {
      type: String,
      trim: true,
      default: "INR",
    },
    coverImage: {
      imageUrl: { type: String, trim: true, default: "", alias: "src" },
      altText:  { type: String, trim: true, default: "", alias: "alt" },
    },
    features: {
      type: [String],
      default: [],
    },
    deliverables: {
      type: String,
      trim: true,
      default: "",
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

ServiceSchema.index({ isPublished: 1, sortOrder: 1, createdAt: -1 });

const Service = model("Service", ServiceSchema);

export default Service;
