import dotenv from "dotenv";
dotenv.config();

import "../src/db/init.mongodb.js";
import userModel from "../src/models/user.model.js";
import bcrypt from "bcryptjs";

async function main() {
  try {
    const newPasswordText = "password123";
    const hashedPassword = await bcrypt.hash(newPasswordText, 10);
    
    // 1. Update vuhailam05@gmail.com
    await userModel.updateOne(
      { email: "vuhailam05@gmail.com" },
      { $set: { password: hashedPassword, isTwoFactorEnabled: false, role: "MENTOR" } }
    );
    console.log("Successfully updated vuhailam05@gmail.com to MENTOR.");

    // 2. Update mentor@sdn.com
    await userModel.updateOne(
      { email: "mentor@sdn.com" },
      { $set: { password: hashedPassword, isTwoFactorEnabled: false, role: "MENTOR" } }
    );
    console.log("Successfully updated mentor@sdn.com password to password123.");
    
  } catch (error: any) {
    console.error("Failed to reset passwords:", error);
  } finally {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  }
}

// Wait for database connection
setTimeout(main, 2000);
