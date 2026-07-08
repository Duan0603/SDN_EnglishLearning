const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  await prisma.user.updateMany({
    data: {
      currentStreak: 6,
      lastCheckIn: yesterday
    }
  });
  console.log('Updated all users via Prisma: currentStreak = 6, lastCheckIn = yesterday');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
