// Redis client singleton
// Architecture: Redis is used ONLY for ephemeral locking (booking concurrency control)
// Access Redis lock utilities via: backend/src/utils/redis-lock.ts
import { createClient } from 'redis';
import { config } from './env.config';

let redisClient: ReturnType<typeof createClient> | null = null;
let isConnected = false;

export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: config.redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 2) {
            isConnected = false;
            return new Error('Redis connection failed');
          }
          return 100;
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('[Redis] Client error:', err);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully');
      isConnected = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('[Redis] Reconnecting...');
    });

    await redisClient.connect();
  }
  return redisClient;
};

export const isRedisReady = (): boolean => isConnected;

// Graceful shutdown
process.on('beforeExit', async () => {
  if (redisClient) {
    await redisClient.quit();
  }
});
