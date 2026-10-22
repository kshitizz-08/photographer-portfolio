import "dotenv/config";
import mongoose from "mongoose";
import Photographer from "../models/Photographer.js";

async function updateCredentials() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  const email = process.env.ADMIN_EMAIL || "jalindarpalephotography@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "Jalu@9900";

  // Find existing photographer
  let photographer = await Photographer.findOne();

  if (!photographer) {
    console.log("No photographer document found. Creating a new one...");
    photographer = new Photographer({
      name: "Jalindar Pale",
      email: email,
      password: password,
    });
    await photographer.save();
    console.log("Created photographer profile with email and password.");
  } else {
    console.log(`Found photographer: ${photographer.name} (${photographer.email})`);
    photographer.email = email;
    photographer.password = password; // Triggers pre("save") hook to hash password with bcrypt
    await photographer.save();
    console.log("Updated photographer profile successfully!");
  }

  // Verify login by testing comparePassword
  const verifyDoc = await Photographer.findOne({ email }).select("+password");
  const isMatch = await verifyDoc.comparePassword(password);
  console.log(`Verification: password match for '${email}' is:`, isMatch);

  await mongoose.disconnect();
}

updateCredentials().catch((err) => {
  console.error("Error updating credentials:", err);
  process.exit(1);
});
