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

    const request = await (prisma as any).mentorRequest.findFirst({
      where: { userId: user.id }
    });
    if (!request) {
      console.log("No request found!");
      return;
    }

    console.log("Before Approval User Role:", user.role);
    console.log("Before Approval Request Status:", request.status);

    const id = request.id;

    // Simulate the transaction in adminMentor.controller.ts
    await prisma.$transaction([
      (prisma as any).mentorRequest.update({
        where: { id },
        data: { status: 'APPROVED' }
      }),
      prisma.user.update({
        where: { id: request.userId },
        data: {
          role: 'MENTOR',
          verify: true,
          status: 'active'
        }
      })
    ]);

    const updatedUser = await prisma.user.findUnique({ where: { id: request.userId } });
    const updatedRequest = await (prisma as any).mentorRequest.findUnique({ where: { id } });

    console.log("After Approval User Role:", updatedUser?.role);
    console.log("After Approval Request Status:", updatedRequest?.status);

  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
