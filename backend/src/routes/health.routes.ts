// Health check route — AC1: GET /health must return { success: true }
// Used by Docker healthcheck and load balancers to verify server availability
import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma.config';

export const healthRouter = Router();

healthRouter.get('/health', async (req: Request, res: Response) => {
  try {
    // Verify Prisma/MongoDB connection is alive with 2s timeout
    const dbPing = prisma.$runCommandRaw({ ping: 1 });
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database ping timeout')), 2000)
    );

    await Promise.race([dbPing, timeout]);

    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  } catch (error) {
    // Server is up but DB is down — still return 200 for basic health
    // but flag the database issue
    res.status(200).json({
      success: true,
      data: {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        warning: 'Database connection unavailable',
      },
    });
  }
});
