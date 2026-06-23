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
  // ── Mongoose (auth, user, keyToken) ─────────────────────────────
  // Mongoose connects via init.mongodb.js (already imported above).
  // It works with standalone MongoDB (no Replica Set required).

  // ── Prisma (exam, booking — needs Replica Set) ──────────────────
  // Non-blocking: warn and continue if Replica Set not configured.
  // Auth/user routes use Mongoose and work without Prisma.
  try {
    await prisma.$connect();
    console.log('[DB] Prisma connected to MongoDB successfully');
  } catch (dbErr: any) {
    console.warn(
      '[DB] Prisma could not connect (Replica Set may not be configured).',
      'Auth routes still work via Mongoose. Exam/Booking routes require Replica Set.',
      '\nError:', dbErr?.message
    );
    // Do NOT exit — Mongoose handles auth routes independently
  }

  // ── Redis (non-blocking) ─────────────────────────────────────────
  try {
    await getRedisClient();
    console.log('[Redis] Connected successfully');
  } catch (redisErr) {
    console.warn('[Redis] Could not connect — booking locking will be unavailable:', redisErr);
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
    httpServer.close(async () => {
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
