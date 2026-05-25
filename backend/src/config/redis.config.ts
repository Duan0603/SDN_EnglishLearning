// Redis client singleton
// Architecture: Redis is used ONLY for ephemeral locking (booking concurrency control)
// Access Redis lock utilities via: backend/src/utils/redis-lock.ts
import { createClient } from 'redis';
import { config } from './env.config';

let redisClient: ReturnType<typeof createClient> | null = null;

export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: config.redisUrl,
    });

    redisClient.on('error', (err) => {
      console.error('[Redis] Client error:', err);
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });

    redisClient.on('reconnecting', () => {
      console.log('[Redis] Reconnecting...');
    });

    await redisClient.connect();
  }
  return redisClient;
};

// Graceful shutdown
process.on('beforeExit', async () => {
  if (redisClient) {
    await redisClient.quit();
  }
});
