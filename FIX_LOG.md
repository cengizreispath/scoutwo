# Fix Log: Real Products Not Showing in Search Detail

## Date: 2026-03-09

## Problem
When clicking "Ürünleri Listele" (List Products) button in search detail page, no real products were appearing. User suspected either scraping issue or mock data.

## Root Cause Analysis
The issue was NOT with the scraping code or mock data. The actual problem was:
1. Coolify was configured with `build_pack: "dockerfile"` 
2. This only deployed the main web application using `Dockerfile`
3. The worker service defined in `docker-compose.yml` was never deployed
4. Without the worker running, scraping jobs were queued but never processed
5. Result: Empty product list (no mock data, just no data at all)

## Solution Implemented
1. Changed Coolify `build_pack` from `"dockerfile"` to `"dockercompose"` via API
2. Renamed `docker-compose.yml` to `docker-compose.yaml` (Coolify requirement)
3. Removed old `docker-compose.yml` file
4. Committed and pushed changes to Git
5. Triggered Coolify redeploy

## Files Modified
- `/docker-compose.yml` → renamed to `/docker-compose.yaml`
- Coolify application configuration (via API)

## Deployment Status
- Web service: Building
- Worker service: Building (installing Playwright dependencies)
- Redis service: Will start after build completes

## Expected Behavior After Fix
1. Worker service will run continuously in background
2. When user clicks "Ürünleri Listele", job is queued in Redis
3. Worker picks up job and executes Playwright scraping
4. Real products are scraped from brand websites
5. Products saved to database and displayed in UI

## Verification Steps
After deployment completes:
1. Check both containers are running (web + worker)
2. Visit search detail page
3. Click "Ürünleri Listele" button
4. Wait for scraping to complete (progress indicator)
5. Verify real products appear in the grid

## Technical Details
- Technology: Docker Compose with 3 services (web, worker, redis)
- Worker: Node.js process running BullMQ worker with Playwright
- Scraper: Real browser automation, not mock data
- Brands supported: Nike, Adidas, and generic fallback for others
