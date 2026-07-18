import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

import "../src/db/init.mongodb.js";
import userModel from "../src/models/user.model.js";

const prisma = new PrismaClient();

async function main() {
  try {
    const prismaUser = await prisma.user.findFirst({
      where: { username: "vuhailam01" }
    });

    if (!prismaUser) {
      console.log("User vuhailam01 not found!");
      return;
    }

    const mongooseUser = await userModel.findOne({ username: "vuhailam01" }).lean();

    console.log("PRISMA USER:", {
      id: prismaUser?.id,
      email: prismaUser?.email,
      role: prismaUser?.role,
    });

    console.log("MONGOOSE USER:", {
      _id: mongooseUser?._id,
      email: mongooseUser?.email,
      role: mongooseUser?.role,
    });

    const requests = await (prisma as any).mentorRequest.findMany({
      where: { userId: prismaUser.id }
    });

    console.log("MENTOR REQUESTS:", requests);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  }
}

setTimeout(main, 2000);
