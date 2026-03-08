# ScoutWo - Product Search & Scraping Platform

## Architecture

```
Frontend (Next.js) → tRPC API → BullMQ Queue → Redis → Worker Process → DB
                                                           ↓
                                                     Playwright Scraper
```

## Services

- **web**: Next.js application (port 3000)
- **worker**: BullMQ worker for background scraping jobs
- **redis**: Redis for job queue

## Deployment

### Docker Compose (Coolify)

The application uses Docker Compose for multi-service deployment:

```bash
docker-compose up -d
```

**Services:**
- `web` - Main Next.js app
- `worker` - Background scraper worker
- `redis` - Job queue storage

### Environment Variables

Required env vars (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string (format: `redis://host:port`)
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - Application URL

### Coolify Setup

1. Create new project in Coolify
2. Select "Docker Compose" deployment
3. Connect GitHub repo: `cengizreispath/scoutwo`
4. Set environment variables
5. Deploy

**Important:** Worker service must be running for "Ürünleri Listele" (List Products) button to work!

## Development

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Seed brands
npm run db:seed

# Start dev server
npm run dev

# Start worker (separate terminal)
npm run scraper:worker
```

## Troubleshooting

### "Ürünleri Listele" button not working

**Symptoms:** Button shows loading animation but products never appear.

**Cause:** Worker service not running or not consuming jobs from Redis queue.

**Solution:**
1. Check worker logs: `docker logs scoutwo-worker-1`
2. Verify Redis connection: `redis-cli ping`
3. Restart worker: `docker-compose restart worker`
4. Check BullMQ queue: Use Bull Board or Redis CLI

### Worker Connection Issues

If worker can't connect to Redis:
- Verify `REDIS_URL` env var is set correctly
- Format: `redis://redis:6379` (for Docker Compose internal network)
- Check Redis container is running: `docker ps | grep redis`
