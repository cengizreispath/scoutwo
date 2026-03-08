import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getRedis } from '@/lib/redis';
import { sql } from 'drizzle-orm';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  // Test database connection
  try {
    await db.execute(sql`SELECT 1`);
    health.services.database = 'connected';
  } catch (error) {
    health.services.database = 'disconnected';
    health.status = 'error';
    console.error('Database connection failed:', error);
  }

  // Test Redis connection
  try {
    const redis = getRedis();
    if (redis) {
      await redis.ping();
      health.services.redis = 'connected';
    } else {
      health.services.redis = 'not_configured';
    }
  } catch (error) {
    health.services.redis = 'disconnected';
    health.status = 'error';
    console.error('Redis connection failed:', error);
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
