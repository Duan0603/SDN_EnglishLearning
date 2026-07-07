import dotenv from "dotenv";
dotenv.config();

import "../src/db/init.mongodb.js";
import { AccessService } from "../src/services/access.service.js";

async function main() {
  try {
    const result = await AccessService.signUp({
      username: "vuhailam05",
      email: "vuhailam05@gmail.com",
      password: "password123",
      fullName: "Lâm Vũ Hải",
      phone: "0919100856",
      role: "STUDENT"
    });
    console.log("Signup success! Result:", result);
  } catch (error: any) {
    console.error("Signup failed with error:", error.status, error.message);
  } finally {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  }
}

// Wait a moment for mongoose to connect
setTimeout(main, 2000);
