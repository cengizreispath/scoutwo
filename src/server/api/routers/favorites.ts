import { z } from 'zod';
import { eq, and, inArray } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { favorites, products } from '@/server/db/schema';

export const favoritesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userFavorites = await ctx.db.query.favorites.findMany({
      where: eq(favorites.userId, ctx.session.userId),
      with: {
        product: {
          with: {
            brand: true,
          },
        },
      },
      orderBy: (favorites, { desc }) => [desc(favorites.createdAt)],
    });

    return userFavorites.map((f) => f.product);
  }),

  add: protectedProcedure
    .input(z.object({ productId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if product exists
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ürün bulunamadı',
        });
      }

      // Check if already favorited
      const existing = await ctx.db.query.favorites.findFirst({
        where: and(
          eq(favorites.userId, ctx.session.userId),
          eq(favorites.productId, input.productId)
        ),
      });

      if (existing) {
        return existing;
      }

      const [newFavorite] = await ctx.db
        .insert(favorites)
        .values({
          userId: ctx.session.userId,
          productId: input.productId,
        })
        .returning();

      return newFavorite;
    }),

  remove: protectedProcedure
    .input(z.object({ productId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, ctx.session.userId),
            eq(favorites.productId, input.productId)
          )
        );

      return { success: true };
    }),

  check: protectedProcedure
    .input(z.object({ productIds: z.array(z.string().uuid()) }))
    .query(async ({ ctx, input }) => {
      if (input.productIds.length === 0) {
        return {};
      }

      const userFavorites = await ctx.db.query.favorites.findMany({
        where: and(
          eq(favorites.userId, ctx.session.userId),
          inArray(favorites.productId, input.productIds)
        ),
      });

      const favoriteMap: Record<string, boolean> = {};
      input.productIds.forEach((id) => {
        favoriteMap[id] = userFavorites.some((f) => f.productId === id);
      });

      return favoriteMap;
    }),
});
