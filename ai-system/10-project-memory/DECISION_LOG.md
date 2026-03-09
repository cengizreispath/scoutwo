# DECISION_LOG.md - ScoutWo

## Recent Decisions

### 2026-03-09: PM2 for Running Both App and Worker
**Decision:** Use PM2 process manager to run both Next.js app and scraper worker in a single container.
**Context:** Coolify docker-compose deployment was only starting the web service, leaving the worker service not running. This caused scraping jobs to queue but never process.
**Trade-offs:**
- ✅ Simpler deployment (single container)
- ✅ Both processes guaranteed to run
- ✅ PM2 provides process monitoring and auto-restart
- ❌ Both processes share same container resources
- ❌ Less isolation than separate containers
**Follow-up:** Monitor container resource usage, may need to increase memory limits.

### 2026-03-09: Generic Scraper Approach
**Decision:** Use a generic scraper with common CSS selectors instead of brand-specific scrapers.
**Context:** Building individual scrapers for 8+ brands is time-consuming.
**Trade-offs:**
- ✅ Faster to implement
- ✅ Easier to add new brands
- ❌ Less reliable extraction
- ❌ May miss brand-specific product details
**Follow-up:** Monitor success rates per brand, add specific selectors where needed.

### 2026-03-09: Turkish Domain Focus
**Decision:** Target Turkish e-commerce domains (zara.com/tr, koton.com, etc.)
**Context:** Primary user base is Turkish.
**Trade-offs:**
- ✅ Prices in TRY
- ✅ Localized product availability
- ❌ Limited to Turkish market

### 2026-03-08: Next.js App Router
**Decision:** Use Next.js 14 with App Router instead of Pages Router.
**Context:** Modern approach, better server components support.
**Trade-offs:**
- ✅ Better DX with server components
- ✅ Improved loading states
- ❌ Some ecosystem libraries not yet compatible

### 2026-03-08: Drizzle ORM
**Decision:** Use Drizzle ORM instead of Prisma.
**Context:** Lighter weight, better TypeScript integration.
**Trade-offs:**
- ✅ Better performance
- ✅ SQL-like syntax
- ❌ Smaller community

## Pending Decisions

### User Authentication
**Options:**
1. NextAuth.js
2. Clerk
3. Custom JWT implementation

**Status:** Not decided. Will implement when user features needed.

### Product Data Updates
**Options:**
1. Scheduled cron jobs
2. On-demand user trigger
3. Webhook from pipeline

**Status:** Currently using on-demand trigger. May add cron later.
