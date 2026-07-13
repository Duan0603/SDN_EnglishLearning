import dotenv from "dotenv";
dotenv.config();

import "../src/db/init.mongodb.js";
import userModel from "../src/models/user.model.js";
import bcrypt from "bcryptjs";

async function main() {
  try {
    const email = "vuhailam05@gmail.com";
    const newPasswordText = "password123";
    
    // Hash password with 10 rounds
    const hashedPassword = await bcrypt.hash(newPasswordText, 10);
    
    // Update the password in MongoDB
    const result = await userModel.updateOne(
      { email: email },
      { $set: { password: hashedPassword, isTwoFactorEnabled: false } }
    );
    
    console.log(`Successfully updated user ${email} password to: ${newPasswordText}`);
    console.log("MongoDB update result:", result);
  } catch (error: any) {
    console.error("Failed to reset password:", error);
  } finally {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  }
}

// Wait for database connection
setTimeout(main, 2000);
