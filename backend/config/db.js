/**
 * config/db.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the Mongoose MongoDB connection lifecycle.
 *
 * Uses process.env.MONGODB_URI as primary connection string.
 * If credentials or connection string are missing, the server logs actionable
 * setup guidance and continues running so that health checks and non-database
 * routes remain fully functional.
 */

import mongoose from "mongoose";
import env from "./env.js";

// Keep track of connection attempts to avoid noisy spam
let connectionLogged = false;

export default async function connectDB() {
  const uri = process.env.MONGODB_URI || env.MONGODB_URI || env.MONGO_URI;

  if (!uri || uri.trim() === "") {
    if (!connectionLogged) {
      console.warn("\n=======================================================");
      console.warn("[MongoDB] Notice: process.env.MONGODB_URI is not configured.");
      console.warn("The server is running in standalone mode (health checks active).");
      console.warn("To connect your MongoDB database:");
      console.warn("  1. Open backend/.env");
      console.warn("  2. Add: MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/photography?retryWrites=true&w=majority");
      console.warn("  3. Restart the server.");
      console.warn("=======================================================\n");
      connectionLogged = true;
    }
    return null;
  }

  // Setup connection event listeners
  mongoose.connection.on("connected", () => {
    console.log(`[MongoDB] Connected successfully to host: ${mongoose.connection.host}`);
  });

  mongoose.connection.on("error", (err) => {
    console.error(`[MongoDB] Runtime error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] Connection disconnected.");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("[MongoDB] Connection re-established.");
  });

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
    });
    return conn;
  } catch (err) {
    console.error(`\n[MongoDB] Initial connection error: ${err.message}`);
    console.warn("Please verify that:");
    console.warn("  1. The MONGODB_URI in your .env file is correct.");
    console.warn("  2. Your IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP -> Allow Anywhere or your current IP).");
    console.warn("  3. Your database username and password are valid.\n");

    // Do not crash the server on initial DB error — checkDb middleware handles
    // data routes (503) while health/ping checks remain 200 OK for uptime monitors
    return null;
  }
}
