# PROJECT_CONTEXT.md
## Stable Project Runtime and Technical Context

---

## 1. Project Identity

### Project Name
ScoutWo

### Repository Name
cengizreispath/scoutwo

### Business Purpose
Kadınlar için akıllı alışveriş asistanı - birden fazla markayı tarayarak ürün karşılaştırması yapma

### Primary Stakeholders
Cengiz Reis (Project Division)

---

## 2. Tech Stack

### Frontend
- Next.js 14 (App Router)
- React
- Tailwind CSS
- shadcn/ui components

### Backend
- Next.js API Routes
- tRPC
- TypeScript

### Database
- PostgreSQL (Drizzle ORM)
- Coolify managed: `z0kc4g0o0gog84sgkg0ggg8g`

### Cache / Queue / Workers
- Redis (BullMQ job queue)
- Coolify managed: `m4kwsksgwoc48c8wggs8ckc4`
- Separate worker container for job processing

### Infrastructure / Hosting
- Coolify (self-hosted on Hetzner)
- Domain: dotthedoor.com

### CI/CD
- GitHub → Coolify auto-deploy on push to main

### Observability
- /api/health endpoint (DB + Redis status)
- Coolify deployment logs

---

## 3. Environments

### Production
- URL: https://scoutwo.dotthedoor.com
- Auto-deploy from main branch
- Real user data

---

## 4. Services Map

| Service | Purpose | Runtime / Image | Port | Depends On | Coolify App ID |
|---------|---------|-----------------|------|------------|----------------|
| scoutwo | Web app (Next.js) | node:20 | 3000 | PostgreSQL, Redis | n0gwgwookgg48cs8o880kss0 |
| scoutwo-worker | BullMQ job processor | node:20-bookworm-slim | - | PostgreSQL, Redis | ss8cgsocokw8kkwk4w88okw8 |
| PostgreSQL | Database | postgres:15 | 5432 | - | z0kc4g0o0gog84sgkg0ggg8g |
| Redis | Job queue | redis:7 | 6379 | - | m4kwsksgwoc48c8wggs8ckc4 |

---

## 5. Deployment Topology

### Hosting Model
Coolify on single Hetzner VPS (89.167.11.39)

### Coolify Mapping

| Coolify App | Purpose | Domain | Notes |
|-------------|---------|--------|-------|
| scoutwo | Main web app | scoutwo.dotthedoor.com | Next.js |
| scoutwo-worker | Job processor | - (no domain) | Dockerfile.worker, Debian base |

### Reverse Proxy / Routing
Traefik (Coolify managed)

### Build / Deploy Triggers
Push to main → Coolify webhook → auto-deploy

### Health Checks
- Web: `GET /api/health` → `{"status":"ok","services":{"database":"connected","redis":"connected"}}`

### Rollback Strategy
Coolify deployment history → redeploy previous version

---

## 6. Data and Integrations

### Databases
- PostgreSQL: users, searches, products, brands

### External APIs
- Brand websites (Nike, Adidas, etc.) via Playwright scraping

### Authentication
- NextAuth.js with JWT
- Cookie-based sessions

---

## 7. Critical Paths

1. **User Authentication** - Login/register flow
2. **Search Creation** - Brand selection, query input
3. **Product Scraping** - "Ürünleri Listele" → BullMQ job → Playwright → DB
4. **Product Display** - Fetching and rendering scraped products

---

## 8. Operational Constraints

- Worker MUST use Debian-based image (not Alpine) for Playwright
- Redis connection requires REDIS_URL parsing (not REDIS_HOST/PORT)
- Worker is separate container, must be deployed independently
- Coolify network: services communicate via container names

---

## 9. Fragile Areas / Known Technical Sensitivities

1. **Worker Deployment** - Often forgotten, separate from main app
2. **Dockerfile.worker** - Must be Debian (node:20-bookworm-slim) for Playwright
3. **Redis URL parsing** - BullMQ needs host/port extracted from REDIS_URL
4. **Brand scraping selectors** - May break if website HTML changes

---

## 10. Agent Working Rules for This Context

When working on ScoutWo:
1. ALWAYS check if worker deployment is needed
2. ALWAYS verify Dockerfile.worker uses Debian base
3. ALWAYS parse REDIS_URL for BullMQ connections
4. Test scraping functionality end-to-end after changes
5. Check both scoutwo AND scoutwo-worker Coolify apps
