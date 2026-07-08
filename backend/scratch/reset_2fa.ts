import dotenv from "dotenv";
dotenv.config();

import "../src/db/init.mongodb.js";
import userModel from "../src/models/user.model.js";

async function main() {
  try {
    const result = await userModel.updateMany(
      { email: { $in: ["admin@sdn.com", "student@sdn.com"] } },
      { $set: { isTwoFactorEnabled: false } }
    );
    console.log("Successfully reset 2FA for test accounts:", result);
  } catch (error: any) {
    console.error("Failed to reset:", error);
  } finally {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  }
}

// Wait for connection
setTimeout(main, 2000);
