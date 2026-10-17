/**
 * scripts/updateBio.js
 * Run once to update the photographer bio in MongoDB.
 * Usage: node --env-file=.env scripts/updateBio.js
 */

import mongoose from "mongoose";
import Photographer from "../models/Photographer.js";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI not set.");
  process.exit(1);
}

const NEW_BIO =
  "I believe every moment has a story worth telling. From the intimacy of weddings and the energy of celebrations to the individuality of portraits and the beauty of the world around us, my photography is driven by a passion for capturing life in all its forms.";

const NEW_BIO_EXTRA =
  "My approach blends creativity, natural light, and genuine emotion to create photographs that feel timeless, authentic, and personal. Whatever the subject, my goal remains the same — to turn fleeting moments into lasting memories.";

const NEW_SHORT_BIO =
  "Photographer passionate about capturing life in all its forms — weddings, celebrations, portraits, and the beauty of the world around us.";

await mongoose.connect(MONGODB_URI);
console.log("✅  Connected to MongoDB");

const result = await Photographer.updateMany(
  {},
  { $set: { bio: NEW_BIO, bioExtra: NEW_BIO_EXTRA, shortBio: NEW_SHORT_BIO } }
);

console.log(`✅  Updated ${result.modifiedCount} photographer record(s).`);
await mongoose.disconnect();
process.exit(0);
