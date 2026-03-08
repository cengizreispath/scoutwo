import { chromium, Browser, Page } from 'playwright';

interface ScrapedProduct {
  externalId: string;
  name: string;
  price: string;
  currency?: string;
  imageUrl: string | null;
  productUrl: string;
  relevanceScore?: number;
}

// Brand-specific scraper configurations
const BRAND_SCRAPERS: Record<string, (page: Page, query: string) => Promise<ScrapedProduct[]>> = {
  // Nike scraper (example)
  nike: async (page: Page, query: string) => {
    try {
      // Navigate to Nike search page
      await page.goto(`https://www.nike.com.tr/search?q=${encodeURIComponent(query)}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for products to load
      await page.waitForSelector('.product-card, .productCard, [data-testid="product-card"]', {
        timeout: 10000,
      }).catch(() => {
        console.log('[Scraper] No products found for Nike');
      });

      // Extract products
      const products = await page.evaluate(() => {
        const items: ScrapedProduct[] = [];
        const productCards = document.querySelectorAll('.product-card, .productCard, [data-testid="product-card"]');
        
        productCards.forEach((card, index) => {
          try {
            const linkEl = card.querySelector('a');
            const nameEl = card.querySelector('.product-name, .product-title, h3, h4');
            const priceEl = card.querySelector('.product-price, .price, [data-testid="price"]');
            const imageEl = card.querySelector('img');
            
            if (linkEl && nameEl && priceEl) {
              const url = linkEl.getAttribute('href') || '';
              const productId = url.split('/').pop() || `nike-${Date.now()}-${index}`;
              const priceText = priceEl.textContent?.trim() || '0';
              const price = priceText.replace(/[^\d.,]/g, '').replace(',', '.');
              
              items.push({
                externalId: `nike-${productId}`,
                name: nameEl.textContent?.trim() || 'Unknown Product',
                price: price || '0',
                currency: 'TRY',
                imageUrl: imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src') || null,
                productUrl: url.startsWith('http') ? url : `https://www.nike.com.tr${url}`,
                relevanceScore: 1.0 - (index * 0.01),
              });
            }
          } catch (err) {
            console.error('Error extracting product:', err);
          }
        });
        
        return items;
      });

      return products;
    } catch (error) {
      console.error('[Scraper] Nike scraper error:', error);
      return [];
    }
  },

  // Adidas scraper (example)
  adidas: async (page: Page, query: string) => {
    try {
      await page.goto(`https://www.adidas.com.tr/search?q=${encodeURIComponent(query)}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      await page.waitForSelector('.product-card, .grid-item', {
        timeout: 10000,
      }).catch(() => {
        console.log('[Scraper] No products found for Adidas');
      });

      const products = await page.evaluate(() => {
        const items: ScrapedProduct[] = [];
        const productCards = document.querySelectorAll('.product-card, .grid-item');
        
        productCards.forEach((card, index) => {
          try {
            const linkEl = card.querySelector('a');
            const nameEl = card.querySelector('.product-name, .product-title, h3, h4');
            const priceEl = card.querySelector('.product-price, .price');
            const imageEl = card.querySelector('img');
            
            if (linkEl && nameEl && priceEl) {
              const url = linkEl.getAttribute('href') || '';
              const productId = url.split('/').pop() || `adidas-${Date.now()}-${index}`;
              const priceText = priceEl.textContent?.trim() || '0';
              const price = priceText.replace(/[^\d.,]/g, '').replace(',', '.');
              
              items.push({
                externalId: `adidas-${productId}`,
                name: nameEl.textContent?.trim() || 'Unknown Product',
                price: price || '0',
                currency: 'TRY',
                imageUrl: imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src') || null,
                productUrl: url.startsWith('http') ? url : `https://www.adidas.com.tr${url}`,
                relevanceScore: 1.0 - (index * 0.01),
              });
            }
          } catch (err) {
            console.error('Error extracting product:', err);
          }
        });
        
        return items;
      });

      return products;
    } catch (error) {
      console.error('[Scraper] Adidas scraper error:', error);
      return [];
    }
  },
};

// Generic/fallback scraper for brands without specific scrapers
const genericScraper = async (page: Page, brandSlug: string, query: string): Promise<ScrapedProduct[]> => {
  console.log(`[Scraper] Using generic scraper for ${brandSlug}`);
  
  // For now, return mock data for testing
  // TODO: Implement real generic scraper or add more brand-specific scrapers
  return [
    {
      externalId: `${brandSlug}-mock-${Date.now()}-1`,
      name: `${query} - Mock Product 1 (${brandSlug})`,
      price: '299.99',
      currency: 'TRY',
      imageUrl: 'https://via.placeholder.com/300x300?text=Product+1',
      productUrl: `https://${brandSlug}.example.com/product-1`,
      relevanceScore: 1.0,
    },
    {
      externalId: `${brandSlug}-mock-${Date.now()}-2`,
      name: `${query} - Mock Product 2 (${brandSlug})`,
      price: '399.99',
      currency: 'TRY',
      imageUrl: 'https://via.placeholder.com/300x300?text=Product+2',
      productUrl: `https://${brandSlug}.example.com/product-2`,
      relevanceScore: 0.95,
    },
    {
      externalId: `${brandSlug}-mock-${Date.now()}-3`,
      name: `${query} - Mock Product 3 (${brandSlug})`,
      price: '199.99',
      currency: 'TRY',
      imageUrl: 'https://via.placeholder.com/300x300?text=Product+3',
      productUrl: `https://${brandSlug}.example.com/product-3`,
      relevanceScore: 0.90,
    },
  ];
};

export async function scrapeProducts(
  brandSlug: string,
  query: string
): Promise<ScrapedProduct[]> {
  console.log(`[Scraper] Starting scrape for ${brandSlug} with query: ${query}`);
  
  // Check if we have a specific scraper for this brand
  const brandScraper = BRAND_SCRAPERS[brandSlug.toLowerCase()];
  
  // Use mock data only when explicitly enabled (for development/testing)
  if (process.env.USE_MOCK_SCRAPER === 'true') {
    console.log(`[Scraper] Using mock data for ${brandSlug} (USE_MOCK_SCRAPER=true)`);
    return genericScraper(null as any, brandSlug, query);
  }

  // Real scraping with Playwright
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    let products: ScrapedProduct[];

    if (brandScraper) {
      products = await brandScraper(page, query);
    } else {
      products = await genericScraper(page, brandSlug, query);
    }

    await context.close();
    
    return products;
  } catch (error) {
    console.error(`[Scraper] Error scraping ${brandSlug}:`, error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
