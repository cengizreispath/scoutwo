import Redis from 'ioredis';

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  return 'redis://localhost:6379';
};

// Lazy initialization to avoid build-time connection
let _redis: Redis | null = null;
let _redisSubscriber: Redis | null = null;

export const getRedis = () => {
  if (!_redis && typeof window === 'undefined' && process.env.REDIS_URL) {
    _redis = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }
  return _redis;
};

export const getRedisSubscriber = () => {
  if (!_redisSubscriber && typeof window === 'undefined' && process.env.REDIS_URL) {
    _redisSubscriber = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }
  return _redisSubscriber;
};

// For backward compatibility (may be null during build)
export const redis = null as unknown as Redis;
export const redisSubscriber = null as unknown as Redis;
