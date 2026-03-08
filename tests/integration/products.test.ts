import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { db } from '@/server/db';
import { users, brands, searches, searchBrands, products, searchResults } from '@/server/db/schema';
import { productsRouter } from '@/server/api/routers/products';
import { eq } from 'drizzle-orm';

/**
 * Integration test for products.getBySearch
 * 
 * Tests the fix for the bug where products don't appear after scraping.
 * The issue was caused by incorrect SQL ANY() syntax in WHERE clauses.
 * 
 * This test verifies that:
 * 1. Products can be properly retrieved using searchBrandIds
 * 2. The inArray() function correctly filters results
 * 3. Multiple searchBrands return correct product counts
 */
describe('Products Router - getBySearch', () => {
  let testUserId: string;
  let testBrandId1: string;
  let testBrandId2: string;
  let testSearchId: string;
  let testSearchBrandId1: string;
  let testSearchBrandId2: string;
  let testProductId1: string;
  let testProductId2: string;

  beforeAll(async () => {
    // Create test user
    const [user] = await db.insert(users).values({
      email: 'test-products@example.com',
      passwordHash: 'test-hash',
    }).returning();
    testUserId = user.id;

    // Create test brands
    const [brand1] = await db.insert(brands).values({
      name: 'Test Brand 1',
      slug: 'test-brand-1',
      websiteUrl: 'https://testbrand1.com',
    }).returning();
    testBrandId1 = brand1.id;

    const [brand2] = await db.insert(brands).values({
      name: 'Test Brand 2',
      slug: 'test-brand-2',
      websiteUrl: 'https://testbrand2.com',
    }).returning();
    testBrandId2 = brand2.id;

    // Create test search
    const [search] = await db.insert(searches).values({
      userId: testUserId,
      name: 'Test Search',
      query: 'test query',
    }).returning();
    testSearchId = search.id;

    // Create search brands
    const [sb1] = await db.insert(searchBrands).values({
      searchId: testSearchId,
      brandId: testBrandId1,
    }).returning();
    testSearchBrandId1 = sb1.id;

    const [sb2] = await db.insert(searchBrands).values({
      searchId: testSearchId,
      brandId: testBrandId2,
    }).returning();
    testSearchBrandId2 = sb2.id;

    // Create test products
    const [product1] = await db.insert(products).values({
      brandId: testBrandId1,
      externalId: 'test-product-1',
      name: 'Test Product 1',
      price: '100.00',
      currency: 'TRY',
      productUrl: 'https://testbrand1.com/product-1',
    }).returning();
    testProductId1 = product1.id;

    const [product2] = await db.insert(products).values({
      brandId: testBrandId2,
      externalId: 'test-product-2',
      name: 'Test Product 2',
      price: '200.00',
      currency: 'TRY',
      productUrl: 'https://testbrand2.com/product-2',
    }).returning();
    testProductId2 = product2.id;

    // Create search results
    await db.insert(searchResults).values({
      searchBrandId: testSearchBrandId1,
      productId: testProductId1,
      relevanceScore: 1.0,
    });

    await db.insert(searchResults).values({
      searchBrandId: testSearchBrandId2,
      productId: testProductId2,
      relevanceScore: 0.95,
    });
  });

  afterAll(async () => {
    // Cleanup test data
    if (testSearchId) {
      await db.delete(searches).where(eq(searches.id, testSearchId));
    }
    if (testBrandId1) {
      await db.delete(brands).where(eq(brands.id, testBrandId1));
    }
    if (testBrandId2) {
      await db.delete(brands).where(eq(brands.id, testBrandId2));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it('should retrieve products for a search with multiple brands', async () => {
    // Create mock context
    const mockCtx = {
      db,
      session: {
        userId: testUserId,
      },
    };

    // Call the tRPC procedure
    const caller = productsRouter.createCaller(mockCtx as any);
    const result = await caller.getBySearch({
      searchId: testSearchId,
      page: 1,
      limit: 20,
    });

    // Verify results
    expect(result.products).toBeDefined();
    expect(result.products.length).toBe(2);
    expect(result.pagination.total).toBe(2);
    
    // Verify product details
    const productIds = result.products.map(p => p.id);
    expect(productIds).toContain(testProductId1);
    expect(productIds).toContain(testProductId2);
  });

  it('should return correct pagination when limit is set', async () => {
    const mockCtx = {
      db,
      session: {
        userId: testUserId,
      },
    };

    const caller = productsRouter.createCaller(mockCtx as any);
    const result = await caller.getBySearch({
      searchId: testSearchId,
      page: 1,
      limit: 1,
    });

    expect(result.products.length).toBe(1);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.totalPages).toBe(2);
  });

  it('should return empty array for search with no brands', async () => {
    // Create search without brands
    const [emptySearch] = await db.insert(searches).values({
      userId: testUserId,
      name: 'Empty Search',
      query: 'empty',
    }).returning();

    const mockCtx = {
      db,
      session: {
        userId: testUserId,
      },
    };

    const caller = productsRouter.createCaller(mockCtx as any);
    const result = await caller.getBySearch({
      searchId: emptySearch.id,
      page: 1,
      limit: 20,
    });

    expect(result.products).toEqual([]);
    expect(result.pagination.total).toBe(0);

    // Cleanup
    await db.delete(searches).where(eq(searches.id, emptySearch.id));
  });
});
