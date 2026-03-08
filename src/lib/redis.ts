import Redis from 'ioredis';

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  // Fallback to host/port if REDIS_URL not provided
  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || '6379';
  return `redis://${host}:${port}`;
};

// Lazy initialization to avoid build-time connection
let _redis: Redis | null = null;
let _redisSubscriber: Redis | null = null;

export const getRedis = (): Redis => {
  if (!_redis && typeof window === 'undefined') {
    _redis = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: true,
      lazyConnect: true,
    });
  }
  return _redis!;
};

export const getRedisSubscriber = (): Redis => {
  if (!_redisSubscriber && typeof window === 'undefined') {
    _redisSubscriber = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: true,
      lazyConnect: true,
    });
  }
  return _redisSubscriber!;
};

// Create a proxy object that lazily initializes Redis only when methods are called
const createLazyRedisProxy = (): Redis => {
  return new Proxy({} as Redis, {
    get(_target, prop) {
      const redis = getRedis();
      // Safety check: if redis is null, return a no-op function or throw a descriptive error
      if (!redis) {
        if (typeof prop === 'string' && ['set', 'get', 'del', 'exists'].includes(prop)) {
          // Return a function that logs but doesn't crash
          return async (...args: any[]) => {
            console.warn(`[Redis] Operation "${prop}" skipped - Redis not initialized`);
            return null;
          };
        }
        return undefined;
      }
      const value = (redis as any)[prop];
      if (typeof value === 'function') {
        return value.bind(redis);
      }
      return value;
    },
  });
};

// Export proxy instances that only connect when actually used
export const redis = createLazyRedisProxy();
export const redisSubscriber = createLazyRedisProxy();
