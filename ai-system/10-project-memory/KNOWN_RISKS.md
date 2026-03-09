# KNOWN_RISKS.md - ScoutWo

## Active Risks

### 🔴 HIGH: Web Scraping Reliability
**Description:** Generic CSS selectors don't work consistently across all fashion brand websites.
**Impact:** Products may not be scraped, or wrong data extracted.
**Mitigation:** 
- Add brand-specific scraper configurations
- Implement fallback strategies
- Consider using product APIs where available

### 🟠 MEDIUM: Anti-Bot Detection
**Description:** Fashion brand websites have anti-bot measures (Cloudflare, reCAPTCHA).
**Impact:** Scraper gets blocked, returns no products.
**Mitigation:**
- Rotate user agents
- Add delays between requests
- Consider using residential proxies
- Implement retry logic with backoff

### 🟠 MEDIUM: Search URL Format Variations
**Description:** Each brand has different search URL patterns.
**Impact:** Search queries may not return correct results.
**Mitigation:**
- Document URL patterns per brand
- Test search URLs manually before automation

### 🟡 LOW: Database Connection Pooling
**Description:** PostgreSQL connections not optimally pooled.
**Impact:** Connection exhaustion under load.
**Mitigation:**
- Configure connection pool size
- Implement connection timeout

### 🟡 LOW: Single Container Resource Contention
**Description:** Next.js app and worker now run in the same container, sharing CPU and memory.
**Impact:** Heavy scraping could slow down the web app, or vice versa.
**Mitigation:**
- Monitor container resource usage
- Increase container memory limit if needed (currently 2G for worker alone)
- Consider splitting back to separate containers if performance degrades

## Resolved Risks

### ✅ Worker Not Running in Production (Resolved 2026-03-09)
**Issue:** Scraper worker service was not running in production, causing scraping jobs to queue but never process. Users clicked "List Products" button but saw no results.
**Resolution:** Migrated from docker-compose multi-service to single container running both Next.js and worker via PM2 process manager.
**Commit:** 4fb3cf6

### ✅ Brand Domain Mismatch (Resolved 2026-03-09)
**Issue:** Database had fashion brands but scraper only configured for sportswear brands.
**Resolution:** Added correct Turkish domain mappings for all seeded brands.
**Commit:** 2eda980

## Risk Assessment Matrix

| Risk | Likelihood | Impact | Priority |
|------|------------|--------|----------|
| Scraping Reliability | High | High | 🔴 Critical |
| Anti-Bot Detection | Medium | High | 🟠 High |
| URL Format Variations | Medium | Medium | 🟠 High |
| DB Connection Pooling | Low | Medium | 🟡 Medium |
