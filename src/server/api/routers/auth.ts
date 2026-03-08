import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { users } from '@/server/db/schema';
import { hashPassword, verifyPassword, createToken, setAuthCookie, clearAuthCookie } from '@/lib/auth';
import { registerSchema, loginSchema } from '@/lib/validations';

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email.toLowerCase()),
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Bu e-posta adresi zaten kayıtlı',
        });
      }

      const passwordHash = await hashPassword(input.password);

      const [newUser] = await ctx.db
        .insert(users)
        .values({
          email: input.email.toLowerCase(),
          passwordHash,
        })
        .returning();

      const token = await createToken({
        userId: newUser.id,
        email: newUser.email,
      });

      await setAuthCookie(token);

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
        },
      };
    }),

  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email.toLowerCase()),
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'E-posta veya şifre hatalı',
        });
      }

      const isValid = await verifyPassword(input.password, user.passwordHash);

      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'E-posta veya şifre hatalı',
        });
      }

      const token = await createToken(
        { userId: user.id, email: user.email },
        input.rememberMe
      );

      await setAuthCookie(token, input.rememberMe);

      return {
        user: {
          id: user.id,
          email: user.email,
        },
      };
    }),

  logout: protectedProcedure.mutation(async () => {
    await clearAuthCookie();
    return { success: true };
  }),

  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      return null;
    }

    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.userId),
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
    };
  }),
});
