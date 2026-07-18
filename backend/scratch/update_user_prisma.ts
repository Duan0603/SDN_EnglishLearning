import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst({
      where: { username: "vuhailam01" }
    });
    if (!user) {
      console.log("User not found!");
      return;
    }
    console.log("Before update:", user.role);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: "MENTOR" }
    });
    console.log("After update:", updated.role);
  } catch (e) {
    console.error("Error updating:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
