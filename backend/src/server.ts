// Server Entry Point
// Starts HTTP server, connects to DB, and handles graceful shutdown
import { createApp } from './app';
import { config } from './config/env.config';
import { prisma } from './config/prisma.config';
import { getRedisClient } from './config/redis.config';

const startServer = async () => {
  // Initialize database connections
  try {
    // Test Prisma/MongoDB connection — AC3
    await prisma.$connect();
    console.log('[DB] Prisma connected to MongoDB successfully');

    // Initialize Redis connection (non-blocking — app runs even if Redis is down)
    try {
      await getRedisClient();
      console.log('[Redis] Connected successfully');
    } catch (redisErr) {
      console.warn('[Redis] Could not connect — booking locking will be unavailable:', redisErr);
    }
  } catch (dbErr) {
    console.error('[DB] Failed to connect to MongoDB:', dbErr);
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`[Server] Running on port: ${config.port} (${config.nodeEnv})`);
  });

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    console.log(`\n[Server] ${signal} received — shutting down gracefully...`);
    
    // Force shutdown after 10s timeout
    const forceExit = setTimeout(() => {
      console.error('[Server] Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);

    server.close(async () => {
      clearTimeout(forceExit);
      await prisma.$disconnect();
      console.log('[Server] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions (ensure graceful shutdown on sync errors)
  process.on('uncaughtException', (err: Error) => {
    console.error('[Server] Uncaught Exception:', err.message);
    shutdown('Uncaught Exception');
  });

  // Handle unhandled rejections (prevent server crash)
  process.on('unhandledRejection', (reason: Error) => {
    console.error('[Server] Unhandled Rejection:', reason.message);
  });
};

startServer();
