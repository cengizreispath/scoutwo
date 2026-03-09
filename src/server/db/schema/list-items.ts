import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { searches } from './searches';
import { products } from './products';

export const listItems = pgTable('list_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  listId: uuid('list_id').references(() => searches.id, { onDelete: 'cascade' }).notNull(),
  productUrl: text('product_url').notNull(),
  productId: uuid('product_id').references(() => products.id),
  status: text('status').default('pending').notNull(), // pending, scraped, failed
  errorMessage: text('error_message'),
  scrapedAt: timestamp('scraped_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const listItemsRelations = relations(listItems, ({ one }) => ({
  list: one(searches, {
    fields: [listItems.listId],
    references: [searches.id],
  }),
  product: one(products, {
    fields: [listItems.productId],
    references: [products.id],
  }),
}));

export type ListItem = typeof listItems.$inferSelect;
export type NewListItem = typeof listItems.$inferInsert;
