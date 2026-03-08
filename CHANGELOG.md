# Changelog

All notable changes to ScoutWo will be documented in this file.

## [Unreleased]

### Fixed
- **Worker Service Not Running** - Fixed "Ürünleri Listele" button hanging issue
  - Added Docker Compose configuration with worker, web, and Redis services
  - Worker now properly consumes BullMQ jobs from Redis queue
  - Jobs are processed and products are scraped correctly
  
### Added
- **Docker Compose Deployment** - Multi-service deployment support
  - `web`: Next.js application service
  - `worker`: BullMQ worker for background scraping
  - `redis`: Redis for job queue storage
  - Health checks for all services
  - Automatic restart on failure
  - Proper service dependencies with health condition checks
  
- **Documentation**
  - README.md with architecture diagram and deployment instructions
  - Deployment validation script (`scripts/validate-deployment.sh`)
  - Troubleshooting guide for common issues
  
- **Testing**
  - Integration tests for worker service
  - Docker Compose deployment validation tests
  - Redis and BullMQ queue tests
  
### Changed
- **Redis Configuration** - Updated to use internal Docker network hostname
  - `REDIS_URL` now uses `redis://redis:6379` for Docker Compose
  - Maintains backward compatibility with localhost for development
  
### Technical Details
- Worker Dockerfile uses `tsx` for TypeScript execution
- Redis persistence with volume mounting
- Graceful shutdown handling (SIGTERM/SIGINT)
- Resource limits for worker service (2GB max memory)
- Health check endpoints for monitoring

---

## How to Deploy

### Using Docker Compose (Recommended for Coolify)

```bash
# Clone the repo
git clone https://github.com/cengizreispath/scoutwo.git
cd scoutwo

# Set environment variables
cp .env.example .env
# Edit .env with your production values

# Start all services
docker-compose up -d

# Validate deployment
./scripts/validate-deployment.sh

# Check logs
docker-compose logs -f worker
```

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: NextAuth.js secret (min 32 chars)
- `NEXTAUTH_URL`: Application URL (e.g., https://scoutwo.dotthedoor.com)

**Note:** `REDIS_URL` is auto-configured in docker-compose.yml to use internal network.

---

## Commits in This Fix

1. **386f8b1** - `fix: Add docker-compose for worker deployment`
   - Added docker-compose.yml
   - Created README.md
   
2. **b1763e2** - `test: Add integration tests and deployment validation`
   - Added worker integration tests
   - Created deployment validation script
   
3. **[current]** - `refactor: QA improvements for docker-compose`
   - Added health checks for web and worker
   - Fixed Redis URL to use internal hostname
   - Added proper service dependencies with health conditions
