import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { searches, searchBrands, brands } from '@/server/db/schema';
import { createSearchSchema, updateSearchSchema } from '@/lib/validations';
import { redis } from '@/lib/redis';
import { Queue } from 'bullmq';

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
      // Fall through to fallback
    }
  }
  
  // Fallback to individual env vars
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  };
};

const scrapeQueue = new Queue('scrape-queue', {
  connection: getRedisConnection(),
});

export const searchesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userSearches = await ctx.db.query.searches.findMany({
      where: eq(searches.userId, ctx.session.userId),
      orderBy: [desc(searches.updatedAt)],
      with: {
        searchBrands: {
          with: {
            brand: true,
          },
        },
      },
    });

    return userSearches;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const search = await ctx.db.query.searches.findFirst({
        where: and(
          eq(searches.id, input.id),
          eq(searches.userId, ctx.session.userId)
        ),
        with: {
          searchBrands: {
            with: {
              brand: true,
            },
          },
        },
      });

      if (!search) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Arama bulunamadı',
        });
      }

      return search;
    }),

  create: protectedProcedure
    .input(createSearchSchema)
    .mutation(async ({ ctx, input }) => {
      const [newSearch] = await ctx.db
        .insert(searches)
        .values({
          userId: ctx.session.userId,
          name: input.name,
          query: input.query,
        })
        .returning();

      // Insert brand associations - convert slugs to UUIDs
      if (input.brandIds.length > 0) {
        // Get brand UUIDs from slugs
        const brandRecords = await ctx.db.query.brands.findMany({
          where: (brands, { inArray }) => inArray(brands.slug, input.brandIds),
        });

        if (brandRecords.length > 0) {
          await ctx.db.insert(searchBrands).values(
            brandRecords.map((brand) => ({
              searchId: newSearch.id,
              brandId: brand.id,
            }))
          );
        }
      }

      return newSearch;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateSearchSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const existingSearch = await ctx.db.query.searches.findFirst({
        where: and(
          eq(searches.id, input.id),
          eq(searches.userId, ctx.session.userId)
        ),
      });

      if (!existingSearch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Arama bulunamadı',
        });
      }

      const [updatedSearch] = await ctx.db
        .update(searches)
        .set({
          name: input.data.name,
          query: input.data.query,
          updatedAt: new Date(),
        })
        .where(eq(searches.id, input.id))
        .returning();

      // Update brand associations if provided - convert slugs to UUIDs
      if (input.data.brandIds) {
        await ctx.db.delete(searchBrands).where(eq(searchBrands.searchId, input.id));
        
        if (input.data.brandIds.length > 0) {
          // Get brand UUIDs from slugs
          const brandRecords = await ctx.db.query.brands.findMany({
            where: (brands, { inArray }) => inArray(brands.slug, input.data.brandIds!),
          });

          if (brandRecords.length > 0) {
            await ctx.db.insert(searchBrands).values(
              brandRecords.map((brand) => ({
                searchId: input.id,
                brandId: brand.id,
              }))
            );
          }
        }
      }

      return updatedSearch;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existingSearch = await ctx.db.query.searches.findFirst({
        where: and(
          eq(searches.id, input.id),
          eq(searches.userId, ctx.session.userId)
        ),
      });

      if (!existingSearch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Arama bulunamadı',
        });
      }

      await ctx.db.delete(searches).where(eq(searches.id, input.id));

      return { success: true };
    }),

  triggerScrape: protectedProcedure
    .input(z.object({ searchId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const search = await ctx.db.query.searches.findFirst({
        where: and(
          eq(searches.id, input.searchId),
          eq(searches.userId, ctx.session.userId)
        ),
        with: {
          searchBrands: {
            with: {
              brand: true,
            },
          },
        },
      });

      if (!search) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Arama bulunamadı',
        });
      }

      // Add job to queue with proper error handling
      try {
        const job = await scrapeQueue.add('scrape-search', {
          searchId: search.id,
          query: search.query,
          brands: search.searchBrands.map((sb) => ({
            searchBrandId: sb.id,
            brandId: sb.brand.id,
            brandSlug: sb.brand.slug,
          })),
        });

        // Store job status in Redis (with error handling for graceful degradation)
        try {
          await redis.set(
            `scrape:${search.id}:status`,
            JSON.stringify({ status: 'queued', jobId: job.id }),
            'EX',
            3600 // 1 hour TTL
          );
        } catch (error) {
          console.error('[Redis] Failed to store scrape status:', error);
          // Continue anyway - the job is queued, Redis status is just for tracking
        }

        return { jobId: job.id, status: 'queued' };
      } catch (error) {
        console.error('[BullMQ] Failed to queue scrape job:', error);
        
        // Check if it's a Redis connection error
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNREFUSED') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Redis bağlantısı kurulamadı. Lütfen sistem yöneticisiyle iletişime geçin.',
          });
        }
        
        // Generic error for other cases
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ürün tarama işlemi başlatılamadı. Lütfen daha sonra tekrar deneyin.',
        });
      }
    }),
});
