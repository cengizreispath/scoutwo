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

// NEW: Scrape single product URL (for comparison lists)
export async function scrapeProductUrl(
  productUrl: string
): Promise<ScrapedProduct | null> {
  const startTime = Date.now();
  console.log(`[Scraper] ▶ Starting single product scrape for URL: ${productUrl}`);

  let browser: Browser | null = null;
  try {
    // Extract domain for brand detection
    const url = new URL(productUrl);
    const domain = url.hostname.replace('www.', '').replace('www2.', '').replace('shop.', '');
    
    console.log(`[Scraper] Launching Chromium browser for ${domain}...`);
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();
    
    // Navigate to product URL
    await page.goto(productUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait a bit for JS to render
    await page.waitForTimeout(2000);

    // Extract product data using multiple strategies
    const product = await page.evaluate((url) => {
      // Strategy 1: Open Graph meta tags
      const getMetaContent = (property: string): string | null => {
        const meta = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
        return meta?.getAttribute('content') || null;
      };

      const ogTitle = getMetaContent('og:title');
      const ogImage = getMetaContent('og:image');
      const ogPriceAmount = getMetaContent('og:price:amount') || getMetaContent('product:price:amount');
      const ogPriceCurrency = getMetaContent('og:price:currency') || getMetaContent('product:price:currency');

      // Strategy 2: JSON-LD structured data
      let jsonLdData: any = null;
      const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const script of jsonLdScripts) {
        try {
          const data = JSON.parse(script.textContent || '');
          if (data['@type'] === 'Product' || (Array.isArray(data) && data.some((d: any) => d['@type'] === 'Product'))) {
            jsonLdData = Array.isArray(data) ? data.find((d: any) => d['@type'] === 'Product') : data;
            break;
          }
        } catch (e) {
          // Invalid JSON, skip
        }
      }

      // Strategy 3: Common CSS selectors
      const titleSelectors = [
        'h1[itemprop="name"]',
        '[itemprop="name"]',
        'h1.product-title',
        'h1.product-name',
        '.product-title',
        '.product-name',
        'h1',
      ];

      const priceSelectors = [
        '[itemprop="price"]',
        '.product-price',
        '.price',
        '[data-testid="price"]',
        '.current-price',
        '.sale-price',
        '.amount',
      ];

      const imageSelectors = [
        'img[itemprop="image"]',
        '.product-image img',
        '.main-image img',
        '[data-testid="product-image"]',
        'img[alt*="Product"]',
        'picture img',
      ];

      let name = ogTitle || jsonLdData?.name || document.title;
      let price = ogPriceAmount;
      let currency = ogPriceCurrency || 'TRY';
      let imageUrl = ogImage;

      // Try JSON-LD data
      if (jsonLdData) {
        name = name || jsonLdData.name;
        if (jsonLdData.offers) {
          const offer = Array.isArray(jsonLdData.offers) ? jsonLdData.offers[0] : jsonLdData.offers;
          price = price || offer.price;
          currency = currency || offer.priceCurrency || 'TRY';
        }
        imageUrl = imageUrl || jsonLdData.image || (Array.isArray(jsonLdData.image) ? jsonLdData.image[0] : null);
      }

      // Fallback to CSS selectors
      if (!name) {
        for (const selector of titleSelectors) {
          const el = document.querySelector(selector);
          if (el && el.textContent?.trim()) {
            name = el.textContent.trim();
            break;
          }
        }
      }

      if (!price) {
        for (const selector of priceSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            const priceText = el.textContent?.trim() || el.getAttribute('content') || '';
            const priceMatch = priceText.match(/[\d.,]+/);
            if (priceMatch) {
              price = priceMatch[0].replace(',', '.');
              break;
            }
          }
        }
      }

      if (!imageUrl) {
        for (const selector of imageSelectors) {
          const el = document.querySelector(selector) as HTMLImageElement;
          if (el && (el.src || el.dataset.src)) {
            imageUrl = el.src || el.dataset.src || null;
            break;
          }
        }
      }

      // Generate external ID from URL
      const urlParts = url.split('/').filter(Boolean);
      const externalId = urlParts[urlParts.length - 1]?.split('?')[0] || `product-${Date.now()}`;

      if (!name || !price) {
        return null;
      }

      return {
        externalId: externalId,
        name: name,
        price: price,
        currency: currency,
        imageUrl: imageUrl,
        productUrl: url,
      };
    }, productUrl);

    await context.close();
    
    const duration = Date.now() - startTime;
    
    if (product) {
      console.log(`[Scraper] ✓ Product scraped successfully in ${duration}ms: ${product.name}`);
      return product;
    } else {
      console.log(`[Scraper] ✗ Could not extract product data from ${productUrl} in ${duration}ms`);
      return null;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Scraper] ✗ Error scraping product URL after ${duration}ms:`, error);
    if (error instanceof Error) {
      console.error(`[Scraper] Error stack:`, error.stack);
    }
    return null;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log(`[Scraper] Browser closed`);
      } catch (err) {
        console.error(`[Scraper] Error closing browser:`, err);
      }
    }
  }
}

export async function scrapeProducts(
  brandSlug: string,
  query: string
): Promise<ScrapedProduct[]> {
  const startTime = Date.now();
  console.log(`[Scraper] ▶ Starting scrape for ${brandSlug} with query: "${query}"`);
  
  // Check if we have a specific scraper for this brand
  const brandScraper = BRAND_SCRAPERS[brandSlug.toLowerCase()];

  // Real scraping with Playwright
  let browser: Browser | null = null;
  try {
    console.log(`[Scraper] Launching Chromium browser...`);
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();
    
    // Add console logging from page
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[Scraper] Browser console error:`, msg.text());
      }
    });

    let products: ScrapedProduct[];

    if (brandScraper) {
      console.log(`[Scraper] Using specific scraper for ${brandSlug}`);
      products = await brandScraper(page, query);
    } else {
      console.log(`[Scraper] Using generic scraper for ${brandSlug}`);
      products = await genericScraper(page, brandSlug, query);
    }

    await context.close();
    
    const duration = Date.now() - startTime;
    console.log(`[Scraper] ✓ Scrape completed for ${brandSlug} in ${duration}ms - found ${products.length} products`);
    
    return products;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Scraper] ✗ Error scraping ${brandSlug} after ${duration}ms:`, error);
    if (error instanceof Error) {
      console.error(`[Scraper] Error stack:`, error.stack);
    }
    return [];
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log(`[Scraper] Browser closed for ${brandSlug}`);
      } catch (err) {
        console.error(`[Scraper] Error closing browser:`, err);
      }
    }
  }
}
