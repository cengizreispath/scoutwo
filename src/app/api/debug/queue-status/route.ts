import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { getRedis } from '@/lib/redis';

// Force dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';

// Parse Redis connection from REDIS_URL or fallback to host/port
const getRedisConnection = () => {
  if (process.env.REDIS_URL) {
    try {
      const url = new URL(process.env.REDIS_URL);
      return {
        host: url.hostname,
        port: parseInt(url.port || '6379'),
        password: url.password || undefined,
        username: url.username || undefined,
      };
    } catch (error) {
      console.error('[Redis] Failed to parse REDIS_URL, falling back to REDIS_HOST/PORT:', error);
    }
  }
  
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  };
};

export async function GET() {
  try {
    const scrapeQueue = new Queue('scrape-queue', {
      connection: getRedisConnection(),
    });

    // Get queue counts
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      scrapeQueue.getWaitingCount(),
      scrapeQueue.getActiveCount(),
      scrapeQueue.getCompletedCount(),
      scrapeQueue.getFailedCount(),
      scrapeQueue.getDelayedCount(),
    ]);

    // Get recent jobs
    const activeJobs = await scrapeQueue.getActive(0, 5);
    const failedJobs = await scrapeQueue.getFailed(0, 5);

    // Test Redis connection
    const redis = getRedis();
    let redisConnected = false;
    try {
      await redis.ping();
      redisConnected = true;
    } catch (error) {
      console.error('[Debug] Redis ping failed:', error);
    }

    return NextResponse.json({
      redis: {
        connected: redisConnected,
        url: process.env.REDIS_URL || 'not set',
        connection: getRedisConnection(),
      },
      queue: {
        name: 'scrape-queue',
        counts: {
          waiting,
          active,
          completed,
          failed,
          delayed,
        },
        recentActive: activeJobs.map(j => ({
          id: j.id,
          data: j.data,
          attemptsMade: j.attemptsMade,
          timestamp: j.timestamp,
        })),
        recentFailed: failedJobs.map(j => ({
          id: j.id,
          data: j.data,
          failedReason: j.failedReason,
          stacktrace: j.stacktrace?.slice(0, 500),
          attemptsMade: j.attemptsMade,
        })),
      },
    });
  } catch (error) {
    console.error('[Debug] Queue status error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
