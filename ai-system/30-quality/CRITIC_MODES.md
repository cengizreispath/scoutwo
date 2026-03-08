# CRITIC_MODES.md
## Optional Specialist Review Lenses

These are temporary review lenses, not separate project owners.

Use them to challenge work from a focused perspective while preserving single-agent context continuity.

---

## 1. Security Critic
Use when:
- auth / permissions / tokens / secrets are involved
- user input reaches sensitive paths
- integrations expose attack surface
- data privacy or compliance is relevant

Questions:
- what trust boundary is crossed?
- what input is insufficiently validated?
- what secret/config could leak or be misused?
- what permission assumption may be unsafe?

---

## 2. Performance Critic
Use when:
- queries, loops, rendering, caching, or heavy integrations are involved
- scale or traffic matters
- the change touches hot paths

Questions:
- where is unnecessary latency introduced?
- what scales poorly?
- what repeated work could be avoided?
- what will degrade under load?

---

## 3. Test Critic
Use when:
- a change is medium or high risk
- behavior is hard to reason about statically
- regression potential is non-trivial

Questions:
- what key scenario is missing?
- what edge case is under-tested?
- what assumption needs runtime proof?
- what negative path was ignored?

---

## 4. Maintainability Critic
Use when:
- abstractions are added
- patterns are evolving
- code complexity is increasing

Questions:
- is this harder to understand than necessary?
- did we add accidental complexity?
- will future modification be awkward?
- should a trade-off be logged explicitly?

---

## 5. Deployment Critic
Use when:
- release sequencing matters
- env/config changes are involved
- migrations, infra, or CI/CD are touched

Questions:
- what fails at deploy time rather than code time?
- what ordering dependency exists?
- what rollback gap exists?
- what runtime signal would confirm success?

---

## 6. Cost Critic
Use when:
- infrastructure, API usage, compute, or vendor usage may materially increase
- performance optimizations have cost implications
- architecture options differ in operational cost

Questions:
- what new recurring cost appears?
- is this cost justified for the business value?
- is there a simpler cheaper path with acceptable trade-offs?

---

## 7. Business Critic
Use when:
- scope is ambiguous
- trade-offs between speed and quality matter
- a technically correct path may not be the best business path

Questions:
- does this solve the actual business need?
- is this too much for the current stage?
- what is the fastest acceptable version?
- what business downside exists if we delay or overbuild?

---

## Usage Rule

When a critic mode is used:
1. keep the same project context
2. review the current proposal from one focused lens
3. return findings clearly
4. integrate findings back into the main flow
5. do not simulate ownership transfer
