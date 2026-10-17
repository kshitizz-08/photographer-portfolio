import mongoose from "mongoose";
import Photographer from "../models/Photographer.js";

await mongoose.connect(process.env.MONGODB_URI);

// Get all records sorted by updatedAt desc
const all = await Photographer.find().sort({ updatedAt: -1 }).select("_id name email").lean();
console.log("Found records:", all.map(r => ({ id: r._id, name: r.name, email: r.email })));

if (all.length > 1) {
  // Keep the most recent, delete the rest
  const toDelete = all.slice(1).map(r => r._id);
  const del = await Photographer.deleteMany({ _id: { $in: toDelete } });
  console.log("🗑️  Deleted", del.deletedCount, "duplicate(s)");
}

// Update the remaining one
const r = await Photographer.updateOne({}, { $set: { email: "jalindarpalephotography@gmail.com" } });
console.log("✅ Updated", r.modifiedCount, "record(s)");

await mongoose.disconnect();
process.exit(0);
