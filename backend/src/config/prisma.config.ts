// Prisma Client singleton — ensures single DB connection throughout app lifetime
// Architecture: All DB access MUST go through this Prisma client at the services/ layer
import { PrismaClient } from '@prisma/client';
import { config } from './env.config';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (config.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown: close Prisma connection on process exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
