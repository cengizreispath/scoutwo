# DECISION_LOG.md
## Architectural and Delivery Decisions

---

### DECISION-001
**Title:** Separate worker container for BullMQ jobs  
**Date:** 2026-03-08  
**Status:** Accepted

#### Context
BullMQ job processing (Playwright scraping) is resource-intensive and runs independently of HTTP requests.

#### Options Considered
1. Run worker in same container as web app
2. Separate worker container
3. Serverless functions

#### Chosen Option
Separate worker container (scoutwo-worker)

#### Why This Won
- Isolation: worker crashes don't affect web app
- Scaling: can scale worker independently
- Clarity: clear separation of concerns

#### Consequences
**Positive:**
- Web app stays responsive
- Worker can be restarted independently
- Clear deployment boundary

**Negative / Trade-Offs:**
- Two Coolify apps to manage
- Easy to forget worker deployment
- More complex initial setup

#### Validation / Follow-Up
Document both services in PROJECT_CONTEXT.md. Include worker in deployment checklists.

---

### DECISION-002
**Title:** Use Debian base image for worker (not Alpine)  
**Date:** 2026-03-08  
**Status:** Accepted

#### Context
Playwright requires system dependencies (chromium, libs) that need apt-get installation.

#### Options Considered
1. Alpine with apk workarounds
2. Debian-based image
3. Pre-built Playwright image

#### Chosen Option
node:20-bookworm-slim (Debian)

#### Why This Won
- Playwright officially supports Debian
- apt-get works out of the box
- bookworm-slim is reasonably small

#### Consequences
**Positive:**
- Playwright installs correctly
- Standard apt-get workflow

**Negative / Trade-Offs:**
- Larger image than Alpine
- Inconsistent with main app (if main uses Alpine)

#### Validation / Follow-Up
Test worker deployment, verify Playwright browser launch.

---

### DECISION-003
**Title:** Process-based single-agent execution model  
**Date:** 2026-03-08  
**Status:** Accepted

#### Context
Initial AI pipeline used role-based multi-agent approach (Product Owner, Architect, Developer, QA, DevOps). This caused context fragmentation and repetitive failed fixes.

#### Options Considered
1. Continue role-based multi-agent
2. Single agent with process phases
3. Hybrid approach

#### Chosen Option
Single persistent agent with execution phases (Understand → Frame → Design → Implement → Verify → Release → Learn)

#### Why This Won
- Maintains full context across phases
- Avoids "handoff theater"
- One brain owns the entire problem
- Better root cause analysis

#### Consequences
**Positive:**
- Stronger project continuity
- Fewer repeated fixes for same issue
- Clearer ownership

**Negative / Trade-Offs:**
- Requires self-critique discipline
- Longer single-agent sessions
- More token consumption per task

#### Validation / Follow-Up
Test with ScoutWo bug fixes. Compare success rate to previous role-based approach.

---

### DECISION-004
**Title:** State-based progress reporting (not percentage)  
**Date:** 2026-03-08  
**Status:** Accepted

#### Context
Pipeline UI needs to show progress. Arbitrary percentages are meaningless.

#### Options Considered
1. Percentage-based progress
2. State-based progress
3. No progress reporting

#### Chosen Option
State-based: understanding, framing, designing, implementing, verifying, release_review, done

#### Why This Won
- Meaningful states
- Matches actual execution phases
- Includes blockers, confidence, risks

#### Consequences
**Positive:**
- Clear visibility into actual state
- Blockers are surfaced
- Release risk is explicit

**Negative / Trade-Offs:**
- UI must handle state strings
- Less granular than percentages

---

## Usage Rules

When adding a new decision:
- Keep it concise but complete
- Focus on why the decision matters
- Include trade-offs honestly
- Update status if later replaced
