import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { redis } from '@/lib/redis';

export const scrapingRouter = createTRPCRouter({
  status: protectedProcedure
    .input(z.object({ searchId: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        const statusStr = await redis.get(`scrape:${input.searchId}:status`);
        
        if (!statusStr) {
          return { status: 'idle' };
        }

        return JSON.parse(statusStr);
      } catch (error) {
        console.error('[Redis] Failed to get scrape status:', error);
        // If Redis is unavailable, return idle status
        return { status: 'idle' };
      }
    }),
});
