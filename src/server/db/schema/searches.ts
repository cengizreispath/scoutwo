import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { brands } from './brands';

export const searches = pgTable('searches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  query: text('query').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const searchBrands = pgTable('search_brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  searchId: uuid('search_id').references(() => searches.id, { onDelete: 'cascade' }).notNull(),
  brandId: uuid('brand_id').references(() => brands.id).notNull(),
  lastScrapedAt: timestamp('last_scraped_at'),
});

export const searchesRelations = relations(searches, ({ one, many }) => ({
  user: one(users, {
    fields: [searches.userId],
    references: [users.id],
  }),
  searchBrands: many(searchBrands),
}));

export const searchBrandsRelations = relations(searchBrands, ({ one }) => ({
  search: one(searches, {
    fields: [searchBrands.searchId],
    references: [searches.id],
  }),
  brand: one(brands, {
    fields: [searchBrands.brandId],
    references: [brands.id],
  }),
}));

export type Search = typeof searches.$inferSelect;
export type NewSearch = typeof searches.$inferInsert;
export type SearchBrand = typeof searchBrands.$inferSelect;
