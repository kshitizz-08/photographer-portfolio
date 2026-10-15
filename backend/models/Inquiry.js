/**
 * models/Inquiry.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mongoose model for client photography shoot inquiries.
 * Supports:
 * - Client details (name, email, phone)
 * - Shoot type (shootType / eventType)
 * - Preferred date (preferredDate / eventDate)
 * - Location
 * - Optional budget
 * - Message
 * - Unique reference ID (auto-generated e.g. INQ-2026-XXXXX)
 * - Workflow status (new, read, replied, booked, archived)
 * - Private admin notes (secured with select: false and omitted in toJSON)
 */

import mongoose from "mongoose";
import crypto from "crypto";

const { Schema, model } = mongoose;

function generateReferenceId() {
  const year = new Date().getFullYear();
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `INQ-${year}-${randomSuffix}`;
}

const InquirySchema = new Schema(
  {
    // Unique tracking ID for client reference
    referenceId: {
      type: String,
      unique: true,
      index: true,
      default: generateReferenceId,
    },

    // Client details
    name: {
      type: String,
      required: [true, "Client name is required."],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters."],
    },
    email: {
      type: String,
      required: [true, "Client email is required."],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [30, "Phone cannot exceed 30 characters."],
      default: "",
    },

    // Shoot details
    shootType: {
      type: String,
      required: [true, "Shoot type is required."],
      trim: true,
      alias: "eventType",
    },
    preferredDate: {
      type: String,
      trim: true,
      default: "",
      alias: "eventDate",
    },
    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Location cannot exceed 200 characters."],
    },
    budget: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: [true, "Message is required."],
      trim: true,
      maxlength: [3000, "Message cannot exceed 3000 characters."],
    },

    // Optional gallery source tracking (?ref=slug)
    referenceGallery: {
      type: String,
      trim: true,
      default: "",
    },

    // Workflow status
    status: {
      type: String,
      enum: {
        values: ["new", "read", "replied", "booked", "archived"],
        message: "{VALUE} is not a valid inquiry status.",
      },
      default: "new",
      index: true,
    },

    // Private notes for photographer/admin only — NEVER exposed in public API responses
    adminNotes: {
      type: String,
      trim: true,
      default: "",
      select: false, // excluded by default in all Mongoose queries
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        // Enforce privacy: never leak admin notes into public JSON responses
        delete ret.adminNotes;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes
InquirySchema.index({ status: 1, createdAt: -1 });

const Inquiry = model("Inquiry", InquirySchema);

export default Inquiry;
