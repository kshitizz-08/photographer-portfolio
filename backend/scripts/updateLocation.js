import mongoose from "mongoose";
import Photographer from "../models/Photographer.js";

await mongoose.connect(process.env.MONGODB_URI);
const r = await Photographer.updateMany({}, { $set: { location: "Khadambe, Rahuri, Ahilyanagar. 413704" } });
console.log("✅ Updated", r.modifiedCount, "record(s)");
await mongoose.disconnect();
process.exit(0);
