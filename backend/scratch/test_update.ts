import { prisma } from "../src/config/prisma.config";

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No users found in database");
      return;
    }
    console.log("Found user:", { id: user.id, email: user.email, isTwoFactorEnabled: user.isTwoFactorEnabled });
    
    // Try updating
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        isTwoFactorEnabled: !user.isTwoFactorEnabled
      }
    });
    console.log("Successfully updated user isTwoFactorEnabled:", updated.isTwoFactorEnabled);
  } catch (error) {
    console.error("Prisma update error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
