# KNOWN_RISKS.md
## Persistent Risk Register

---

## Active Risks

### RISK-001
**Title:** Worker container deployment often forgotten  
**Status:** Mitigated  
**Severity:** High  
**Likelihood:** High  
**Area:** Deployment

#### Description
scoutwo-worker is a separate Coolify application. When fixing bugs related to job processing, developers often forget to deploy the worker container, only deploying the main web app.

#### Why It Matters
BullMQ jobs are queued but never processed. "Ürünleri Listele" button appears to work but nothing happens.

#### Trigger / Signal
- Button clicks succeed but no products appear after waiting
- Redis queue grows but jobs don't complete

#### Mitigation
- PROJECT_CONTEXT.md documents both services
- Agent must check if worker changes are involved
- Deploy checklist includes worker verification

#### Contingency
Check Coolify for both apps, trigger worker redeploy if needed

#### Related Decisions
DECISION-001

---

### RISK-002
**Title:** Dockerfile.worker must use Debian, not Alpine  
**Status:** Mitigated  
**Severity:** High  
**Likelihood:** Medium  
**Area:** Deployment

#### Description
Playwright requires apt-get for browser dependencies. Alpine Linux doesn't have apt-get, causing build failures.

#### Why It Matters
Worker build fails with "apt-get: not found" error.

#### Trigger / Signal
- Coolify deployment fails
- Build log shows "apt-get: not found"

#### Mitigation
- Dockerfile.worker uses `node:20-bookworm-slim` (Debian)
- PROJECT_CONTEXT.md documents this requirement

#### Contingency
Check Dockerfile.worker base image, change to Debian if Alpine

#### Related Decisions
DECISION-002

---

### RISK-003
**Title:** BullMQ requires REDIS_URL parsing  
**Status:** Mitigated  
**Severity:** Medium  
**Likelihood:** Medium  
**Area:** Architecture

#### Description
Coolify provides REDIS_URL but BullMQ's default config expects REDIS_HOST and REDIS_PORT. Connection fails silently.

#### Why It Matters
Jobs are queued but worker can't connect to Redis.

#### Trigger / Signal
- Worker starts but no jobs are processed
- Connection refused errors in logs

#### Mitigation
- getRedisConnection() function parses REDIS_URL
- Extracts host, port, password from URL

#### Contingency
Check Redis connection code, ensure URL parsing

---

### RISK-004
**Title:** Mock scraper is default behavior  
**Status:** Mitigated  
**Severity:** Medium  
**Likelihood:** Low  
**Area:** Product

#### Description
If USE_MOCK_SCRAPER env is not set, scraper previously defaulted to mock data. Now inverted - real scraping is default.

#### Why It Matters
Users see fake placeholder products instead of real ones.

#### Trigger / Signal
- All products look identical
- Product names are generic placeholders

#### Mitigation
- Logic inverted: real scraping is default
- USE_MOCK_SCRAPER=true required for mock mode

---

### RISK-005
**Title:** Brand website HTML changes break selectors  
**Status:** Open  
**Severity:** Medium  
**Likelihood:** Medium  
**Area:** Integration

#### Description
Playwright scraping depends on CSS selectors. When Nike/Adidas updates their website, selectors may break.

#### Why It Matters
Scraping returns empty or incorrect data.

#### Trigger / Signal
- Products array is empty after scraping
- Console errors about missing elements

#### Mitigation
- Error handling returns partial data
- Logging for selector failures

#### Contingency
Update selectors in scraper.ts, redeploy worker

---

## Closed Risks

(none yet)

---

## Usage Rules

Update this file when:
- A new risk is discovered during development
- A risk status changes (mitigated, closed)
- New mitigation strategies are implemented
