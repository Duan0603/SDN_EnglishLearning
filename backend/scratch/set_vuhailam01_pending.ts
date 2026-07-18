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
    // Set user role to STUDENT
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "STUDENT" }
    });
    console.log("Updated user role to STUDENT");

    // Set request status to PENDING
    await (prisma as any).mentorRequest.updateMany({
      where: { userId: user.id },
      data: { status: "PENDING" }
    });
    console.log("Updated mentor request status to PENDING");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
