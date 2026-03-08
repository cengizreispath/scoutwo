import { pgTable, text, timestamp, uuid, decimal, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { brands } from './brands';
import { searchBrands } from './searches';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').references(() => brands.id).notNull(),
  externalId: text('external_id').notNull().unique(),
  name: text('name').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('TRY').notNull(),
  imageUrl: text('image_url'),
  productUrl: text('product_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const searchResults = pgTable('search_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  searchBrandId: uuid('search_brand_id').references(() => searchBrands.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  relevanceScore: real('relevance_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one }) => ({
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
}));

export const searchResultsRelations = relations(searchResults, ({ one }) => ({
  searchBrand: one(searchBrands, {
    fields: [searchResults.searchBrandId],
    references: [searchBrands.id],
  }),
  product: one(products, {
    fields: [searchResults.productId],
    references: [products.id],
  }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type SearchResult = typeof searchResults.$inferSelect;
