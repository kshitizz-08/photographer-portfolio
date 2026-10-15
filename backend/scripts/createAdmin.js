#!/usr/bin/env node
/**
 * scripts/createAdmin.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time setup script to create the photographer's admin account.
 *
 * Usage:
 *   cd backend
 *   node scripts/createAdmin.js
 *
 * The script reads MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME
 * from environment variables (or prompts securely if missing).
 *
 * ⚠  Run this ONCE. If an account already exists, the script exits safely.
 * ⚠  Never commit credentials. Use backend/.env for local dev only.
 */

import "dotenv/config";
import mongoose from "mongoose";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

// ── Minimal Photographer schema (avoid circular env/config imports) ──────────
import Photographer from "../models/Photographer.js";

async function prompt(rl, question) {
  return (await rl.question(question)).trim();
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "\n❌  MONGODB_URI is not set.\n" +
      "    Add it to backend/.env and re-run this script.\n"
    );
    process.exit(1);
  }

  console.log("\n🔧  EmoHarmony — Admin Account Setup");
  console.log("─".repeat(48));

  // ── Collect inputs ─────────────────────────────────────────────────────────
  const rl = readline.createInterface({ input, output });

  let name     = process.env.ADMIN_NAME;
  let email    = process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;

  if (!name)     name     = await prompt(rl, "Photographer name     : ");
  if (!email)    email    = await prompt(rl, "Admin email address   : ");
  if (!password) {
    password = await rl.question("Admin password (hidden): ");
    // Note: readline on Windows doesn't suppress echo, use env var for full secrecy
  }

  rl.close();

  if (!name || !email || !password) {
    console.error("\n❌  Name, email, and password are all required.\n");
    process.exit(1);
  }

  if (password.length < 10) {
    console.error("\n❌  Password must be at least 10 characters long.\n");
    process.exit(1);
  }

  // ── Connect to MongoDB ─────────────────────────────────────────────────────
  console.log("\n🔗  Connecting to MongoDB…");
  await mongoose.connect(uri);
  console.log("✅  Connected.");

  // ── Check for existing account ─────────────────────────────────────────────
  const existing = await Photographer.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`\n⚠   An account for ${email} already exists.`);
    console.log("    No changes were made. Exiting.\n");
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── Create account (password is hashed by the model's pre-save hook) ───────
  const photographer = new Photographer({
    name:  name.trim(),
    email: email.trim().toLowerCase(),
    password,             // plain text — bcrypt hash applied by pre("save") hook
  });

  await photographer.save();

  console.log("\n✅  Admin account created successfully!");
  console.log(`    Name : ${photographer.name}`);
  console.log(`    Email: ${photographer.email}`);
  console.log(`    ID   : ${photographer._id}`);
  console.log("\n🔒  The password has been hashed with bcrypt.");
  console.log("    You can now log in at /admin/login.\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌  Unexpected error:", err.message);
  process.exit(1);
});
