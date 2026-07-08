import dotenv from "dotenv";
dotenv.config();

import "../src/db/init.mongodb.js";
import userModel from "../src/models/user.model.js";

async function main() {
  try {
    const users = await userModel.find({}, "email username role isTwoFactorEnabled").lean();
    console.log("All users in MongoDB:");
    console.log(JSON.stringify(users, null, 2));
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
  } finally {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  }
}

// Wait for connection
setTimeout(main, 2000);
