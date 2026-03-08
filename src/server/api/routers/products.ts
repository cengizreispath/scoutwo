import { z } from 'zod';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { products, searchResults, searchBrands, searches } from '@/server/db/schema';

export const productsRouter = createTRPCRouter({
  getBySearch: protectedProcedure
    .input(z.object({
      searchId: z.string().uuid(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
      sortBy: z.enum(['price_asc', 'price_desc', 'newest']).optional().default('newest'),
    }))
    .query(async ({ ctx, input }) => {
      // Verify user owns this search
      const search = await ctx.db.query.searches.findFirst({
        where: and(
          eq(searches.id, input.searchId),
          eq(searches.userId, ctx.session.userId)
        ),
        with: {
          searchBrands: true,
        },
      });

      if (!search) {
        return {
          products: [],
          pagination: { total: 0, page: 1, limit: input.limit, totalPages: 0 },
          lastScrapedAt: null,
        };
      }

      const searchBrandIds = search.searchBrands.map((sb) => sb.id);

      if (searchBrandIds.length === 0) {
        return {
          products: [],
          pagination: { total: 0, page: 1, limit: input.limit, totalPages: 0 },
          lastScrapedAt: null,
        };
      }

      // Get order by clause
      let orderByClause;
      switch (input.sortBy) {
        case 'price_asc':
          orderByClause = asc(products.price);
          break;
        case 'price_desc':
          orderByClause = desc(products.price);
          break;
        default:
          orderByClause = desc(searchResults.createdAt);
      }

      // Get total count
      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(searchResults)
        .where(sql`${searchResults.searchBrandId} = ANY(${searchBrandIds})`);

      const total = Number(countResult[0]?.count ?? 0);
      const totalPages = Math.ceil(total / input.limit);
      const offset = (input.page - 1) * input.limit;

      // Get products
      const results = await ctx.db
        .select({
          product: products,
          searchResult: searchResults,
        })
        .from(searchResults)
        .innerJoin(products, eq(searchResults.productId, products.id))
        .where(sql`${searchResults.searchBrandId} = ANY(${searchBrandIds})`)
        .orderBy(orderByClause)
        .limit(input.limit)
        .offset(offset);

      // Get last scraped time
      const lastScrapeResult = await ctx.db
        .select({ lastScrapedAt: searchBrands.lastScrapedAt })
        .from(searchBrands)
        .where(sql`${searchBrands.id} = ANY(${searchBrandIds})`)
        .orderBy(desc(searchBrands.lastScrapedAt))
        .limit(1);

      return {
        products: results.map((r) => r.product),
        pagination: {
          total,
          page: input.page,
          limit: input.limit,
          totalPages,
        },
        lastScrapedAt: lastScrapeResult[0]?.lastScrapedAt ?? null,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.products.findFirst({
        where: eq(products.id, input.id),
        with: {
          brand: true,
        },
      });
    }),
});
