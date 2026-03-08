import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';

export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  websiteUrl: text('website_url').notNull(),
  logoUrl: text('logo_url'),
  isActive: boolean('is_active').default(true).notNull(),
  scraperConfig: jsonb('scraper_config'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
