import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { brands } from '@/server/db/schema';

export const brandsRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.brands.findMany({
      where: eq(brands.isActive, true),
      orderBy: (brands, { asc }) => [asc(brands.name)],
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.brands.findFirst({
        where: eq(brands.id, input.id),
      });
    }),
});
