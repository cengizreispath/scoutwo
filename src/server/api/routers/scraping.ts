import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { getRedis } from '@/lib/redis';

export const scrapingRouter = createTRPCRouter({
  status: protectedProcedure
    .input(z.object({ searchId: z.string().uuid() }))
    .query(async ({ input }) => {
      const redis = getRedis();
      
      if (!redis) {
        return { status: 'idle' };
      }
      
      const statusStr = await redis.get(`scrape:${input.searchId}:status`);
      
      if (!statusStr) {
        return { status: 'idle' };
      }

      return JSON.parse(statusStr);
    }),
});
