// Server Entry Point
// Starts HTTP server, connects to DB, and handles graceful shutdown
import http from 'http';
import { createApp } from './app';
import { initSockets } from './sockets';
import { config } from './config/env.config';
import { prisma } from './config/prisma.config';
import { getRedisClient } from './config/redis.config';
import './db/init.mongodb';

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
  const httpServer = http.createServer(app);

  // Initialize Socket.io
  initSockets(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`[Server] Running on port: ${config.port} (${config.nodeEnv})`);
  });

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    console.log(`\n[Server] ${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('[Server] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions (prevent server crash)
  process.on('unhandledRejection', (reason: Error) => {
    console.error('[Server] Unhandled Rejection:', reason.message);
    // In production, you may want to gracefully restart
  });
};

startServer();
