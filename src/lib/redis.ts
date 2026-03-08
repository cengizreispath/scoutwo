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
    });
  }
  return _redisSubscriber!;
};

// Export singleton instances for direct usage
export const redis = getRedis();
export const redisSubscriber = getRedisSubscriber();
