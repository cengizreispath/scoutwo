# ScoutWo Deployment Guide

## Architecture

ScoutWo consists of two services:
1. **Web App** (Next.js) - Main application
2. **Worker** (BullMQ) - Product scraping background jobs

## Coolify Deployment

### 1. Web App (Already Deployed)

- App ID: `n0gwgwookgg48cs8o880kss0`
- Domain: `scoutwo.dotthedoor.com`
- Dockerfile: `Dockerfile`
- Auto-deploy: Enabled

### 2. Worker Service (Needs Manual Setup)

The worker service must be deployed separately to process scraping jobs.

#### Option A: Create New Coolify App

1. Go to Coolify dashboard
2. Create new application
3. **Name:** `scoutwo-worker`
4. **Repository:** `https://github.com/cengizreispath/scoutwo`
5. **Branch:** `main`
6. **Dockerfile:** `Dockerfile.worker`
7. **Port:** No port (background service)
8. **Environment Variables:** (copy from main app)
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_SECRET`

#### Option B: Docker Compose (Recommended)

Create `docker-compose.yml` in Coolify project:

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL
      - REDIS_URL
      - JWT_SECRET
      - NEXTAUTH_URL
      - NEXT_PUBLIC_APP_URL
    restart: unless-stopped

  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    environment:
      - DATABASE_URL
      - REDIS_URL
    restart: unless-stopped
    depends_on:
      - web
```

#### Option C: Quick Fix - Run Worker in Web Container

Temporarily, modify `package.json` to run worker alongside Next.js:

```json
{
  "scripts": {
    "start": "node -r esbuild-register src/scraper/worker.ts & next start"
  }
}
```

**Note:** This is NOT recommended for production. Use separate services.

## Environment Variables

Required for both services:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string (for BullMQ)
- `JWT_SECRET` - JWT signing secret
- `NEXTAUTH_URL` - Full app URL (web only)
- `NEXT_PUBLIC_APP_URL` - Public app URL (web only)

## Testing Worker

After deployment, test the worker:

1. Log into ScoutWo
2. Create a search
3. Click "Ürünleri Listele"
4. Check worker logs in Coolify
5. Products should appear within seconds (mock data) or minutes (real scraping)

## Monitoring

### Worker Logs

```bash
# In Coolify, check worker container logs
docker logs -f <worker-container-id>
```

### Redis Queue Status

```bash
# Check queue length
redis-cli -u $REDIS_URL LLEN bull:scrape-queue:wait
```

### Database

Check `search_results` table for newly scraped products:

```sql
SELECT COUNT(*) FROM search_results WHERE created_at > NOW() - INTERVAL '1 hour';
```

## Troubleshooting

### Worker not processing jobs

1. Check worker container is running
2. Check Redis connection
3. Check worker logs for errors
4. Verify DATABASE_URL and REDIS_URL are correct

### No products appearing

1. Check worker logs
2. Verify scraper is returning data
3. Check database connections
4. Review `scrape:${searchId}:status` in Redis

### Playwright errors

If using real scraping (not mock data):
- Ensure chromium is installed in worker container
- Check Dockerfile.worker includes `playwright install --with-deps`
- Review scraper.ts for brand-specific issues

## Scaling

- **Web App:** Scale horizontally (multiple instances)
- **Worker:** Adjust `concurrency` in worker.ts (default: 2)
- **Redis:** Use managed Redis for high availability

## Future Improvements

- [ ] Add health check endpoint for worker
- [ ] Implement job metrics (Prometheus/Grafana)
- [ ] Add retry logic for failed scrapes
- [ ] Implement rate limiting per brand
- [ ] Add webhook notifications on job completion
