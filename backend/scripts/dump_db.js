import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function dump() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.client.db("photography_portfolio");
  const galleries = await db.collection("galleries").find({}).toArray();
  console.log("=== GALLERIES (" + galleries.length + ") ===");
  for (const g of galleries) {
    console.log(JSON.stringify(g, null, 2));
  }
  const photos = await db.collection("portfolioimages").find({}).toArray();
  console.log("=== PORTFOLIO IMAGES (" + photos.length + ") ===");
  for (const p of photos) {
    console.log(p.title, p.category, p.imageUrl);
  }
  process.exit(0);
}

dump().catch(console.error);
