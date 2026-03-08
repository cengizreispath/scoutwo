import { pgTable, timestamp, uuid, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { products } from './products';

export const favorites = pgTable('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueUserProduct: unique().on(table.userId, table.productId),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [favorites.productId],
    references: [products.id],
  }),
}));

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
