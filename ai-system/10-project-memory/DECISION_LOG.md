# Decision Log - ScoutWo

## 2026-03-09: Transform to Product Comparison Lists

**Decision:** Removed search-based product aggregation, replaced with manual product URL addition for comparison lists.

**Rationale:**
- User feedback indicated desire for product comparison across multiple sites
- Search functionality limited to predefined brand sites
- Manual URL input allows flexibility to compare any product from any site

**Implementation:**
- Database: Added `list_items` table, made `searches.query` optional
- Backend: New tRPC mutations for adding/removing product URLs
- Scraper: Implemented generic product extraction using Open Graph tags, JSON-LD, and microdata
- Frontend: Removed search form query/brand inputs, added URL input component
- UI: Changed all "Arama" (search) terminology to "Liste" (list)

**Trade-offs:**
- Lost automated product discovery via search
- Gained flexibility to compare products from any e-commerce site
- Generic scraping may be less reliable than brand-specific scrapers
- Better user control over which products to compare

**Risks:**
- Generic scraping may fail on some sites → Mitigated with multiple extraction strategies
- Anti-bot detection → Using same Playwright stealth techniques
- Brand auto-creation from domain → May create duplicate brands

**Commit:** 8af9653

---

## 2026-03-09: Fixed Worker Not Running in Production

**Decision:** Migrated from docker-compose multi-service to single container running both Next.js and worker via PM2.

**Rationale:** Worker was not running in production, causing scraping jobs to queue but never process.

**Implementation:** Combined web app and worker in single Dockerfile with PM2 process manager.

**Commit:** 4fb3cf6

---

## 2026-03-09: Fixed Brand Domain Mismatch

**Decision:** Updated scraper domain mappings to match Turkish fashion brands in database.

**Rationale:** Database had fashion brands but scraper was configured for sportswear brands.

**Commit:** 2eda980
