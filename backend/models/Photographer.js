/**
 * models/Photographer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mongoose model for the photographer profile & credentials.
 * Supports:
 * - Profile details, bios, portrait image, hero taglines, social links
 * - Hashed password (select: false) using bcrypt
 * - comparePassword helper method
 * - Private notes (select: false)
 * - toJSON transformation guaranteeing password & private notes are never sent
 * - Schema validation, timestamps, and indexes
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;

const PhotographerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Photographer name is required."],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters."],
    },
    title: {
      type: String,
      trim: true,
      default: "Fine Art & Editorial Photographer",
    },
    email: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
      index: true,
    },
    // Authentication password for admin panel — NEVER exposed publicly
    password: {
      type: String,
      select: false, // Omitted by default from queries
    },
    bio: {
      type: String,
      trim: true,
      default: "",
      maxlength: [5000, "Bio cannot exceed 5000 characters."],
    },
    shortBio: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Short bio cannot exceed 500 characters."],
    },
    profileImage: {
      imageUrl: { type: String, trim: true, default: "", alias: "src" },
      altText:  { type: String, trim: true, default: "", alias: "alt" },
    },
    heroHeading: {
      type: String,
      trim: true,
      default: "Capturing Moments That Last Forever.",
    },
    heroSubheading: {
      type: String,
      trim: true,
      default: "Visual storyteller specializing in authentic love stories, portraits, and refined aesthetics.",
    },
    location: {
      type: String,
      trim: true,
      default: "San Francisco, CA & Worldwide",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    socialLinks: {
      instagram: { type: String, trim: true, default: "https://instagram.com" },
      facebook:  { type: String, trim: true, default: "https://facebook.com" },
      pinterest: { type: String, trim: true, default: "https://pinterest.com" },
      twitter:   { type: String, trim: true, default: "https://twitter.com" },
    },
    stats: [
      {
        label: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
    // Private administrative notes — NEVER exposed in public API responses
    privateNotes: {
      type: String,
      trim: true,
      default: "",
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        // Enforce strict security: remove password and internal notes
        delete ret.password;
        delete ret.privateNotes;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Hash password before saving if modified
PhotographerSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  // Don't re-hash if it's already a bcrypt hash ($2a$ / $2b$)
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare candidate password
PhotographerSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const Photographer = model("Photographer", PhotographerSchema);

export default Photographer;
