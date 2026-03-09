import { Worker, Job } from 'bullmq';
import { db } from '@/server/db';
import { products, searchResults, searchBrands } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { getRedis } from '@/lib/redis';
import { scrapeProducts } from './scraper';

// Parse Redis connection from REDIS_URL or fallback to host/port
const getRedisConnection = () => {
  if (process.env.REDIS_URL) {
    try {
      const url = new URL(process.env.REDIS_URL);
      return {
        host: url.hostname,
        port: parseInt(url.port || '6379'),
        password: url.password || undefined,
        username: url.username || undefined,
      };
    } catch (error) {
      console.error('[Redis] Failed to parse REDIS_URL, falling back to REDIS_HOST/PORT:', error);
      // Fall through to fallback
    }
  }
  
  // Fallback to individual env vars
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  };
};

interface ScrapeJobData {
  searchId: string;
  query: string;
  brands: {
    searchBrandId: string;
    brandId: string;
    brandSlug: string;
  }[];
}

const worker = new Worker<ScrapeJobData>(
  'scrape-queue',
  async (job: Job<ScrapeJobData>) => {
    const { searchId, query, brands: jobBrands } = job.data;
    
    console.log(`[Worker] Processing scrape job for search ${searchId}`);
    
    try {
      // Update status to processing
      const redis = getRedis();
      try {
        await redis.set(
          `scrape:${searchId}:status`,
          JSON.stringify({ status: 'processing', jobId: job.id }),
          'EX',
          3600
        );
      } catch (redisError) {
        console.error('[Worker] Failed to update Redis status to processing:', redisError);
        // Continue anyway - status update is not critical
      }

      // Process each brand
      for (const brand of jobBrands) {
        console.log(`[Worker] Scraping ${brand.brandSlug} for query: ${query}`);
        
        try {
          // Scrape products from the brand website
          const scrapedProducts = await scrapeProducts(brand.brandSlug, query);
          
          console.log(`[Worker] Found ${scrapedProducts.length} products from ${brand.brandSlug}`);
          
          // Insert/update products and create search results
          for (const scrapedProduct of scrapedProducts) {
            // Check if product already exists
            const existingProduct = await db.query.products.findFirst({
              where: eq(products.externalId, scrapedProduct.externalId),
            });

            let productId: string;

            if (existingProduct) {
              // Update existing product
              const [updated] = await db
                .update(products)
                .set({
                  name: scrapedProduct.name,
                  price: scrapedProduct.price,
                  imageUrl: scrapedProduct.imageUrl,
                  productUrl: scrapedProduct.productUrl,
                  updatedAt: new Date(),
                })
                .where(eq(products.id, existingProduct.id))
                .returning();
              
              productId = updated.id;
            } else {
              // Insert new product
              const [inserted] = await db
                .insert(products)
                .values({
                  brandId: brand.brandId,
                  externalId: scrapedProduct.externalId,
                  name: scrapedProduct.name,
                  price: scrapedProduct.price,
                  currency: scrapedProduct.currency || 'TRY',
                  imageUrl: scrapedProduct.imageUrl,
                  productUrl: scrapedProduct.productUrl,
                })
                .returning();
              
              productId = inserted.id;
            }

            // Check if search result already exists
            const existingSearchResult = await db.query.searchResults.findFirst({
              where: (sr, { and, eq }) => and(
                eq(sr.searchBrandId, brand.searchBrandId),
                eq(sr.productId, productId)
              ),
            });

            if (!existingSearchResult) {
              // Create search result
              await db.insert(searchResults).values({
                searchBrandId: brand.searchBrandId,
                productId,
                relevanceScore: scrapedProduct.relevanceScore,
              });
            }
          }

          // Update lastScrapedAt for this search brand
          await db
            .update(searchBrands)
            .set({ lastScrapedAt: new Date() })
            .where(eq(searchBrands.id, brand.searchBrandId));

        } catch (error) {
          console.error(`[Worker] Error scraping ${brand.brandSlug}:`, error);
          // Continue with next brand instead of failing entire job
        }
      }

      // Update status to completed
      try {
        await redis.set(
          `scrape:${searchId}:status`,
          JSON.stringify({ status: 'completed', jobId: job.id }),
          'EX',
          3600
        );
      } catch (redisError) {
        console.error('[Worker] Failed to update Redis status to completed:', redisError);
        // Continue anyway - job is done successfully
      }

      console.log(`[Worker] Completed scrape job for search ${searchId}`);
      
      return { success: true };
    } catch (error) {
      console.error('[Worker] Job failed:', error);
      
      // Update status to failed
      const redis = getRedis();
      try {
        await redis.set(
          `scrape:${searchId}:status`,
          JSON.stringify({ 
            status: 'failed', 
            jobId: job.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          }),
          'EX',
          3600
        );
      } catch (redisError) {
        console.error('[Worker] Failed to update Redis status to failed:', redisError);
        // Continue anyway
      }
      
      throw error;
    }
  },
  {
    connection: getRedisConnection(),
    concurrency: 2, // Process 2 jobs at a time
  }
);

worker.on('completed', (job) => {
  console.log(`[Worker] ✓ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] ✗ Job ${job?.id} failed:`, err);
  console.error(`[Worker] Job data:`, JSON.stringify(job?.data, null, 2));
});

worker.on('error', (err) => {
  console.error('[Worker] ⚠ Worker error:', err);
});

worker.on('active', (job) => {
  console.log(`[Worker] → Job ${job.id} started processing`);
});

// Verify Playwright is available
async function verifyPlaywright() {
  try {
    const { chromium } = await import('playwright');
    console.log('[Worker] ✓ Playwright chromium available');
    return true;
  } catch (error) {
    console.error('[Worker] ✗ Playwright not available:', error);
    return false;
  }
}

// Log worker readiness
async function logWorkerStatus() {
  console.log('========================================');
  console.log('[Worker] ScoutWo scraper worker starting...');
  console.log('[Worker] Redis connection:', getRedisConnection());
  console.log('[Worker] Queue: scrape-queue');
  console.log('[Worker] Concurrency: 2');
  
  const playwrightOk = await verifyPlaywright();
  if (!playwrightOk) {
    console.error('[Worker] ⚠ WARNING: Playwright check failed - scraping may not work!');
  }
  
  console.log('[Worker] ✓ Worker ready - waiting for jobs...');
  console.log('========================================');
}

logWorkerStatus().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker] SIGTERM received, closing worker...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker] SIGINT received, closing worker...');
  await worker.close();
  process.exit(0);
});
