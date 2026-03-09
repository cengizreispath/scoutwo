# Feature Design: Product Comparison Lists

## Overview
Transform ScoutWo from a search-based product aggregator to a manual product comparison tool where users create lists and add product links from any e-commerce site.

## Current State
- Users create "searches" with keywords and select brands
- System scrapes products from predefined brand websites
- Products displayed in grid after scraping completes

## Desired State
- Users create "lists" (collections)
- Users manually paste product URLs from any site
- System extracts product details from each URL
- Products from different sites can be compared in one list

---

## 🗄️ Database Schema Changes

### Option A: Minimal Changes (Recommended)
Keep existing table names, change semantics and UI only:

```sql
-- searches table: Keep as is, remove query requirement
ALTER TABLE searches ALTER COLUMN query DROP NOT NULL;
ALTER TABLE searches ALTER COLUMN query SET DEFAULT '';

-- Drop search_brands table (no longer needed)
DROP TABLE search_brands CASCADE;

-- Keep products table as is (already supports any domain)
-- Keep search_results as list_products semantically

-- Add new table for tracking user-added URLs
CREATE TABLE list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES searches(id) ON DELETE CASCADE NOT NULL,
  product_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, scraped, failed
  error_message TEXT,
  scraped_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Option B: Full Rename (More work, cleaner semantics)
```sql
-- Rename searches to lists
ALTER TABLE searches RENAME TO lists;
ALTER TABLE search_results RENAME TO list_products;
-- Update all foreign key references
-- Update all code references
```

**Decision: Use Option A** for faster implementation, can refactor later if needed.

---

## 🎨 UI Changes

### 1. List Creation Form (`/lists/new`)
**Remove:**
- Search query input field
- Brand selector component

**Keep:**
- List name input
- Create button

**Add:**
- Description field (optional)
- "Ürünleri daha sonra ekleyebilirsiniz" hint text

### 2. List Detail Page (`/lists/[id]`)
**Remove:**
- "Ürünleri Listele" button
- Search query display
- Selected brands card
- Scrape status polling for all brands

**Add:**
- "Ürün Ekle" button/form at top
- URL input field with "Add" button
- Individual product loading state (per URL)
- Error handling for invalid URLs

**Update:**
- Title: "Aramalarım" → "Listelerim"
- Empty state: "Henüz arama yok" → "Henüz ürün yok"
- Call-to-action: "Yeni Arama" → "Yeni Liste"

### 3. Homepage
**Update hero section:**
- "Tüm Markalar, Tek Arama" → "Ürünleri Karşılaştır"
- "...tek bir yerden arayın" → "Farklı sitelerden ürünleri tek listede karşılaştır"

**Update features:**
- "Çoklu Marka Arama" → "Çoklu Site Karşılaştırma"
- Description: "Zara'dan, H&M'den, herhangi bir siteden ürün ekleyin"

### 4. Navigation & Labels
Replace all instances:
- "Arama" → "Liste"
- "Aramalar" → "Listeler"
- "Yeni Arama" → "Yeni Liste"

---

## 🔧 Backend Changes

### 1. Database Schema (Drizzle ORM)

**Create new schema file: `src/server/db/schema/list-items.ts`**
```typescript
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { searches } from './searches';

export const listItems = pgTable('list_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  listId: uuid('list_id').references(() => searches.id, { onDelete: 'cascade' }).notNull(),
  productUrl: text('product_url').notNull(),
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
}));

export type ListItem = typeof listItems.$inferSelect;
export type NewListItem = typeof listItems.$inferInsert;
```

**Update searches schema: `src/server/db/schema/searches.ts`**
- Make `query` field optional (nullable with default empty string)
- Remove `searchBrands` relation
- Add `listItems` relation

### 2. Validations (`src/lib/validations.ts`)

```typescript
// Update createSearchSchema
export const createListSchema = z.object({
  name: z.string().min(1, 'Liste adı gerekli').max(50, 'Liste adı en fazla 50 karakter olabilir'),
  description: z.string().max(200).optional(),
});

// New validation for adding product URLs
export const addProductUrlSchema = z.object({
  listId: z.string().uuid(),
  productUrl: z.string().url('Geçerli bir URL girin'),
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type AddProductUrlInput = z.infer<typeof addProductUrlSchema>;
```

### 3. tRPC Routers

**Update `src/server/api/routers/searches.ts`** (rename to lists.ts)
```typescript
// Remove brand-related logic
// Update create mutation to not require query or brandIds
// Add new mutations:
// - addProductUrl: Add URL to list and trigger scrape
// - removeProductUrl: Remove a product from list
```

**New router methods:**
```typescript
export const listsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { /* ... */ }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => { /* ... */ }),
  
  create: protectedProcedure
    .input(createListSchema)
    .mutation(async ({ ctx, input }) => {
      // Create list with optional query field as empty string
    }),
  
  update: protectedProcedure
    .input(z.object({ id: z.string(), data: createListSchema.partial() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),
  
  // NEW: Add product URL to list
  addProductUrl: protectedProcedure
    .input(addProductUrlSchema)
    .mutation(async ({ ctx, input }) => {
      // 1. Validate URL
      // 2. Create list_item record with status='pending'
      // 3. Queue scraping job for this specific URL
      // 4. Return list_item
    }),
  
  // NEW: Remove product URL from list
  removeProductUrl: protectedProcedure
    .input(z.object({ listItemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete list_item and associated product if not used elsewhere
    }),
});
```

### 4. Scraper Changes (`src/scraper/scraper.ts`)

**Current:** `scrapeSearch(searchId, brandSlug, query)`
**New:** `scrapeProductUrl(listItemId, productUrl)`

```typescript
export async function scrapeProductUrl(
  listItemId: string,
  productUrl: string
): Promise<ScrapedProduct | null> {
  // 1. Extract domain from URL
  // 2. Try generic e-commerce selectors (Open Graph, microdata, JSON-LD)
  // 3. Fallback to common CSS selectors
  // 4. Extract: name, price, image, brand (from domain or page)
  // 5. Update list_item status to 'scraped' or 'failed'
  // 6. Create/update product record
  // 7. Link product to list via search_results
}

// Generic product extraction strategy:
// 1. Try Open Graph tags: og:title, og:image, og:price:amount
// 2. Try Schema.org JSON-LD: @type=Product
// 3. Try microdata: itemprop=name, price, image
// 4. Fallback to common selectors: h1, .price, .product-image
```

### 5. Worker Updates (`src/scraper/worker.ts`)

**Current job:** `scrape-search` → scrapes all brands for a search
**New job:** `scrape-product-url` → scrapes single product URL

```typescript
// Add new job handler
worker.on('scrape-product-url', async (job) => {
  const { listItemId, productUrl } = job.data;
  await scrapeProductUrl(listItemId, productUrl);
});
```

---

## 🚀 Implementation Plan

### Phase 1: Database Migration
1. Create migration file for `list_items` table
2. Make `searches.query` nullable
3. Drop `search_brands` table (after backing up if needed)
4. Run migration on development database

### Phase 2: Backend Implementation
1. Create `list-items.ts` schema file
2. Update `searches.ts` schema (remove searchBrands relation, add listItems)
3. Update validations (`createListSchema`, `addProductUrlSchema`)
4. Create/update tRPC routers:
   - Update searches router (remove brand logic)
   - Add `addProductUrl` mutation
   - Add `removeProductUrl` mutation
5. Update scraper:
   - Create `scrapeProductUrl` function
   - Implement generic product extraction
6. Update worker:
   - Add `scrape-product-url` job handler

### Phase 3: Frontend Implementation
1. Update all text labels (Arama → Liste)
2. Update SearchForm component:
   - Remove query input
   - Remove BrandSelector
   - Rename to ListForm
3. Update list detail page:
   - Remove "Ürünleri Listele" button
   - Add "Ürün Ekle" form/modal
   - Add URL input and submit
   - Show individual product loading states
4. Update homepage hero and features
5. Update empty states

### Phase 4: Testing
1. Test list creation (without query/brands)
2. Test adding product URLs from different sites
3. Test product scraping and extraction
4. Test error handling for invalid URLs
5. Test product removal from lists
6. Test favorites still work

### Phase 5: Deployment
1. Run migration on production database
2. Deploy new code to Coolify
3. Test on production (scoutwo.dotthedoor.com)
4. Monitor for errors

---

## 🎯 Success Criteria

- ✅ Users can create empty lists without search queries
- ✅ Users can add product URLs from any e-commerce site
- ✅ System extracts product details (name, price, image) from URLs
- ✅ Products from different sites display together in one list
- ✅ Favorites functionality still works
- ✅ No references to "arama" (search) in UI
- ✅ All existing lists/favorites preserved after migration

---

## ⚠️ Risks & Mitigations

### Risk 1: Generic scraping may fail for some sites
**Mitigation:** 
- Implement multiple extraction strategies (OG tags, JSON-LD, microdata, CSS)
- Show clear error messages to users
- Allow manual retry
- Log failures to improve extraction logic

### Risk 2: Data migration may affect existing users
**Mitigation:**
- Backup database before migration
- Make `query` field nullable instead of dropping
- Keep existing products intact
- Test migration on staging first

### Risk 3: Anti-bot detection on diverse sites
**Mitigation:**
- Use same Playwright setup with stealth techniques
- Add per-site rate limiting
- Consider using proxy/residential IPs if needed
- Implement retry with exponential backoff

---

## 📝 Migration Script

```sql
-- Migration: Transform searches to comparison lists
BEGIN;

-- 1. Create list_items table
CREATE TABLE IF NOT EXISTS list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES searches(id) ON DELETE CASCADE NOT NULL,
  product_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  error_message TEXT,
  scraped_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2. Make query field optional in searches
ALTER TABLE searches ALTER COLUMN query DROP NOT NULL;
ALTER TABLE searches ALTER COLUMN query SET DEFAULT '';

-- 3. Update existing searches to have empty query
UPDATE searches SET query = '' WHERE query IS NULL;

-- 4. Drop search_brands table (no longer needed)
DROP TABLE IF EXISTS search_brands CASCADE;

-- 5. Create indexes for performance
CREATE INDEX idx_list_items_list_id ON list_items(list_id);
CREATE INDEX idx_list_items_status ON list_items(status);

COMMIT;
```

---

## 🔄 Rollback Plan

If issues arise:
1. Restore database from backup
2. Revert code deployment
3. Investigate issues
4. Fix and retry

Keep backup of:
- Database state before migration
- Previous deployment

---

## 📚 Documentation Updates

Update these files:
1. **PROJECT_CONTEXT.md** - Update architecture description
2. **KNOWN_RISKS.md** - Add new risks for generic scraping
3. **DECISION_LOG.md** - Document architectural decisions
4. **README.md** - Update feature description and usage
