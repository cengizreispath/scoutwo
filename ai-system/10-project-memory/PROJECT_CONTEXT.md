# PROJECT_CONTEXT.md - ScoutWo

## Architecture

```
scoutwo/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Homepage
│   │   ├── searches/        # Search management
│   │   └── api/             # API routes
│   ├── components/          # React components
│   ├── db/                  # Drizzle ORM schema
│   ├── lib/                 # Utilities
│   └── scraper/             # Playwright scraping logic
├── ai-system/               # AI agent operating system
├── drizzle/                 # Database migrations
└── public/                  # Static assets
```

## Database Schema

### Tables
- `brands` - Fashion brand definitions (name, slug, logo)
- `categories` - Product categories
- `searches` - User search configurations
- `search_brands` - Many-to-many: searches ↔ brands
- `search_categories` - Many-to-many: searches ↔ categories
- `products` - Scraped products
- `search_products` - Many-to-many: searches ↔ products

## Scraper Architecture

### Current Implementation
- `src/scraper/scraper.ts` - Main scraper module
- Uses Playwright for browser automation
- Generic scraper with brand-specific domain mappings
- Falls back to common CSS selectors for product extraction

### Supported Brands (Turkish domains)
- Zara: zara.com/tr
- H&M: www2.hm.com/tr_tr
- Mango: shop.mango.com/tr
- Massimo Dutti: massimodutti.com/tr
- Koton: koton.com
- LC Waikiki: lcwaikiki.com/tr-TR/TR
- Beymen: beymen.com
- Network: network.com.tr

### Known Limitations
- Generic selectors may not work for all brands
- Anti-bot measures on some sites
- Search URL format varies by brand

## API Endpoints

- `GET /api/searches` - List all searches
- `POST /api/searches` - Create new search
- `GET /api/searches/[id]` - Get search details
- `GET /api/searches/[id]/products` - Get products for search
- `POST /api/searches/[id]/scrape` - Trigger product scraping

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

Optional:
- `PLAYWRIGHT_HEADLESS` - Run browser headless (default: true)
