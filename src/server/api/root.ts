import { createTRPCRouter, createCallerFactory } from './trpc';
import { authRouter } from './routers/auth';
import { brandsRouter } from './routers/brands';
import { searchesRouter } from './routers/searches';
import { productsRouter } from './routers/products';
import { favoritesRouter } from './routers/favorites';
import { scrapingRouter } from './routers/scraping';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  brands: brandsRouter,
  searches: searchesRouter,
  products: productsRouter,
  favorites: favoritesRouter,
  scraping: scrapingRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
