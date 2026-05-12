const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sdn.com' },
    update: {},
    create: {
      email: 'admin@sdn.com',
      username: 'admin_sdn',
      fullName: 'SDN Admin',
      password: password,
      role: 'ADMIN',
    },
  });

  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@sdn.com' },
    update: {},
    create: {
      email: 'mentor@sdn.com',
      username: 'mentor_sdn',
      fullName: 'SDN Mentor',
      password: password,
      role: 'MENTOR',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@sdn.com' },
    update: {},
    create: {
      email: 'student@sdn.com',
      username: 'student_sdn',
      fullName: 'SDN Student',
      password: password,
      role: 'STUDENT',
    },
  });

  console.log('Seed data processed successfully (using upsert)!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
