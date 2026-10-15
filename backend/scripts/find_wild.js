import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const adminDb = mongoose.connection.db.admin();
  const dbs = await adminDb.listDatabases();
  console.log("Databases on cluster:", dbs.databases.map(d => d.name));

  for (const dbInfo of dbs.databases) {
    if (["admin", "local"].includes(dbInfo.name)) continue;
    const db = mongoose.connection.client.db(dbInfo.name);
    const cols = await db.listCollections().toArray();
    console.log("DB:", dbInfo.name, "collections:", cols.map(c => c.name));
    for (const c of cols) {
      const allDocs = await db.collection(c.name).find({}).toArray();
      for (const doc of allDocs) {
        const str = JSON.stringify(doc);
        if (str.includes("Wild") || str.includes("wild") || str.includes("Maasai")) {
          console.log(`\n*** MATCH in ${dbInfo.name} -> ${c.name} ***`);
          console.log(JSON.stringify(doc, null, 2));
        }
      }
    }
  }
  process.exit(0);
}

check().catch(console.error);
