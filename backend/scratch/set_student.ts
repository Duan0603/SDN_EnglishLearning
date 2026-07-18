import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "vuhailam05@gmail.com" }
    });

    if (!user) {
      console.log("User vuhailam05@gmail.com not found!");
      return;
    }

    // 1. Update user role to STUDENT
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "STUDENT" }
    });
    console.log("Successfully updated role to STUDENT for", user.email);

    // 2. Delete mentor requests for this user
    const deleted = await (prisma as any).mentorRequest.deleteMany({
      where: { userId: user.id }
    });
    console.log("Deleted matching mentor requests.");

  } catch (error) {
    console.error("Error running script:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
