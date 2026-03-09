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

---

## 🔧 Debugging & Access Commands

### Database Access
```bash
# Get connection string from Coolify
curl -s "https://coolify.dotthedoor.com/api/v1/databases/z0kc4g0o0gog84sgkg0ggg8g" \
  -H "Authorization: Bearer $(cat /root/.coolify_token)" | jq -r '.connection_string'

# Useful queries (run via psql or API)
# List brands:
SELECT id, name, slug FROM brands;

# List recent searches:
SELECT id, name, created_at FROM searches ORDER BY created_at DESC LIMIT 5;

# Check products for a search:
SELECT p.name, p.price, p.brand_slug FROM products p
JOIN search_products sp ON p.id = sp.product_id
WHERE sp.search_id = 'SEARCH_ID';

# Check scraper results:
SELECT brand_slug, COUNT(*) as count FROM products GROUP BY brand_slug;
```

### Application Logs
```bash
# Get recent logs from Coolify
curl -s "https://coolify.dotthedoor.com/api/v1/applications/n0gwgwookgg48cs8o880kss0/logs" \
  -H "Authorization: Bearer $(cat /root/.coolify_token)" | jq -r '.logs' | tail -50
```

### Deployment
```bash
# Trigger redeploy
curl -X POST "https://coolify.dotthedoor.com/api/v1/deploy" \
  -H "Authorization: Bearer $(cat /root/.coolify_token)" \
  -H "Content-Type: application/json" \
  -d '{"uuid":"n0gwgwookgg48cs8o880kss0","force":true}'

# Check deployment status
curl -s "https://coolify.dotthedoor.com/api/v1/applications/n0gwgwookgg48cs8o880kss0" \
  -H "Authorization: Bearer $(cat /root/.coolify_token)" | jq '{status, updated_at}'
```

### Local Testing
```bash
# Run scraper test for a brand
cd /tmp/scoutwo
npm run dev &
curl -X POST "http://localhost:3000/api/searches/TEST_ID/scrape" \
  -H "Content-Type: application/json"
```

### Redis Queue Check
```bash
# Check pending jobs (requires redis-cli or API)
# Jobs are queued in BullMQ format
```
