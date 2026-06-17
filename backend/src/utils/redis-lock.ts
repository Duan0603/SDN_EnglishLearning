import { getRedisClient } from '../config/redis.config';

/**
 * Acquire a non-blocking lock on a key using Redis SETNX with a TTL.
 * @param lockKey Key to set in Redis
 * @param ttlSeconds Lock timeout in seconds (default 10)
 * @returns boolean true if lock acquired successfully, false if already locked
 */
export const acquireLock = async (lockKey: string, ttlSeconds: number = 10): Promise<boolean> => {
  try {
    const redis = await getRedisClient();
    // SET lockKey locked NX EX ttlSeconds
    const result = await redis.set(lockKey, 'locked', {
      NX: true,
      EX: ttlSeconds,
    });
    return result === 'OK';
  } catch (error) {
    console.error('[Redis Lock] Failed to acquire lock:', error);
    return false;
  }
};

/**
 * Release a lock by deleting the key in Redis.
 * @param lockKey Lock key to release
 */
export const releaseLock = async (lockKey: string): Promise<void> => {
  try {
    const redis = await getRedisClient();
    await redis.del(lockKey);
  } catch (error) {
    console.error('[Redis Lock] Failed to release lock:', error);
  }
};
