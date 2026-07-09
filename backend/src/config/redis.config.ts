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
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.error('[Redis] Max retries reached, giving up.');
            return new Error('Max retries reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err: any) => {
      // Suppress huge stack traces for simple connection refused errors
      if (err?.message?.includes('ECONNREFUSED')) {
        console.warn('[Redis] Connection refused. Is Redis running on ' + config.redisUrl + '?');
      } else {
        console.error('[Redis] Client error:', err.message || err);
      }
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
