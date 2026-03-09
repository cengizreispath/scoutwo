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
  
  try {
    // Common brand domains (fashion brands from DB + sportswear brands)
    const brandDomains: Record<string, string> = {
      // Fashion brands (seeded in DB)
      'zara': 'zara.com/tr',
      'hm': 'www2.hm.com/tr_tr',
      'mango': 'shop.mango.com/tr',
      'massimo-dutti': 'massimodutti.com/tr',
      'koton': 'koton.com',
      'lcw': 'lcwaikiki.com/tr-TR/TR',
      'beymen': 'beymen.com',
      'network': 'network.com.tr',
      // Sportswear brands (for future use)
      'puma': 'puma.com.tr',
      'reebok': 'reebok.com.tr',
      'new-balance': 'newbalance.com.tr',
      'converse': 'converse.com.tr',
      'vans': 'vans.com.tr',
      'under-armour': 'underarmour.com.tr',
      'asics': 'asics.com.tr',
      'skechers': 'skechers.com.tr',
      'fila': 'fila.com.tr',
      'hummel': 'hummel.com.tr',
      'le-coq-sportif': 'lecoqsportif.com.tr',
      'diadora': 'diadora.com.tr',
    };

    const domain = brandDomains[brandSlug] || `${brandSlug}.com.tr`;
    const searchUrl = `https://${domain}/search?q=${encodeURIComponent(query)}`;
    
    console.log(`[Scraper] Attempting to scrape ${searchUrl}`);
    
    await page.goto(searchUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait a bit for JS to render
    await page.waitForTimeout(2000);

    // Try to find common product card selectors
    const productSelectors = [
      '.product-card',
      '.product-item',
      '.product',
      '.grid-item',
      '[data-testid="product-card"]',
      '[data-testid="product"]',
      '.productCard',
      '.ProductCard',
      'article[data-product]',
      '.c-product',
      '.o-product',
    ];

    let productCards = null;
    for (const selector of productSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        productCards = await page.$$(selector);
        if (productCards && productCards.length > 0) {
          console.log(`[Scraper] Found ${productCards.length} products using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!productCards || productCards.length === 0) {
      console.log(`[Scraper] No products found for ${brandSlug}`);
      return [];
    }

    // Extract products using common patterns
    const products = await page.evaluate((brandSlug) => {
      const items: ScrapedProduct[] = [];
      
      // Common selectors for product elements
      const selectors = {
        card: ['.product-card', '.product-item', '.product', '.grid-item', '[data-testid="product-card"]', '.productCard', 'article'],
        link: ['a[href*="/product"]', 'a', 'a[href*="/p/"]', 'a[href*="/item"]'],
        name: ['.product-name', '.product-title', 'h3', 'h4', 'h2', '[data-testid="product-name"]', '.name', '.title'],
        price: ['.product-price', '.price', '[data-testid="price"]', '.amount', '.current-price', '.sale-price'],
        image: ['img'],
      };

      // Find all product cards
      let cards: Element[] = [];
      for (const selector of selectors.card) {
        const found = Array.from(document.querySelectorAll(selector));
        if (found.length > 0) {
          cards = found;
          break;
        }
      }

      cards.forEach((card, index) => {
        try {
          // Find link
          let linkEl: HTMLAnchorElement | null = null;
          for (const selector of selectors.link) {
            linkEl = card.querySelector(selector) as HTMLAnchorElement;
            if (linkEl && linkEl.href) break;
          }

          // Find name
          let nameEl: HTMLElement | null = null;
          for (const selector of selectors.name) {
            nameEl = card.querySelector(selector) as HTMLElement;
            if (nameEl && nameEl.textContent?.trim()) break;
          }

          // Find price
          let priceEl: HTMLElement | null = null;
          for (const selector of selectors.price) {
            priceEl = card.querySelector(selector) as HTMLElement;
            if (priceEl && priceEl.textContent?.trim()) break;
          }

          // Find image
          let imageEl: HTMLImageElement | null = null;
          for (const selector of selectors.image) {
            imageEl = card.querySelector(selector) as HTMLImageElement;
            if (imageEl && (imageEl.src || imageEl.dataset.src)) break;
          }

          if (linkEl && nameEl && priceEl) {
            const url = linkEl.href || '';
            const productId = url.split('/').filter(Boolean).pop()?.split('?')[0] || `${brandSlug}-${Date.now()}-${index}`;
            const priceText = priceEl.textContent?.trim() || '0';
            
            // Extract numeric price
            const priceMatch = priceText.match(/[\d.,]+/);
            const price = priceMatch ? priceMatch[0].replace(',', '.') : '0';

            const imageUrl = imageEl?.src || imageEl?.dataset?.src || null;

            items.push({
              externalId: `${brandSlug}-${productId}`,
              name: nameEl.textContent?.trim() || 'Unknown Product',
              price: price || '0',
              currency: 'TRY',
              imageUrl: imageUrl,
              productUrl: url,
              relevanceScore: 1.0 - (index * 0.01),
            });
          }
        } catch (err) {
          console.error('Error extracting product:', err);
        }
      });

      return items;
    }, brandSlug);

    console.log(`[Scraper] Extracted ${products.length} products from ${brandSlug}`);
    return products;

  } catch (error) {
    console.error(`[Scraper] Generic scraper error for ${brandSlug}:`, error);
    return [];
  }
};

export async function scrapeProducts(
  brandSlug: string,
  query: string
): Promise<ScrapedProduct[]> {
  console.log(`[Scraper] Starting scrape for ${brandSlug} with query: ${query}`);
  
  // Check if we have a specific scraper for this brand
  const brandScraper = BRAND_SCRAPERS[brandSlug.toLowerCase()];

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
