const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const counts = await prisma.test.groupBy({
    by: ['type'],
    _count: {
      id: true
    }
  });
  console.log("=== TEST COUNTS BY TYPE ===");
  console.log(counts);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
