# RELEASE_CHECKLIST.md
## Release and Operational Readiness

This checklist exists to ensure that implementation completion is not confused with production readiness.

A change is not operationally ready just because the code looks correct.

The project agent must use this checklist before declaring medium or high-impact work ready for release.

---

## 1. Scope of Release Review

Use this checklist for:
- production-bound code changes
- environment/config changes
- integration changes
- migrations
- infrastructure changes
- pipeline changes
- changes with user-visible behavior impact

For very small low-risk changes, this may be applied in a compressed form.

---

## 2. Change Summary

Before release review, capture:

### What is changing?
[describe the change]

### Why is it changing?
[business or technical reason]

### What areas are affected?
[list systems/modules/services]

### What is the blast radius?
[small / medium / large + explanation]

---

## 3. Pre-Release Checklist

### Functional Readiness
- [ ] change addresses intended scope
- [ ] acceptance criteria are covered
- [ ] obvious regressions have been reviewed
- [ ] edge cases were considered at an appropriate depth

### Technical Readiness
- [ ] implementation aligns with the intended design
- [ ] no accidental scope expansion is hidden in the change
- [ ] config changes are identified
- [ ] dependency changes are identified
- [ ] migrations are identified if applicable

### Environment Readiness
- [ ] required env variables are known
- [ ] secrets / credentials impact is understood
- [ ] infrastructure dependencies are known
- [ ] target environments affected are clear
- [ ] environment-specific behavior risks are noted

### Pipeline / Build Readiness
- [ ] build implications are known
- [ ] CI/CD changes are identified
- [ ] artifacts/build steps are compatible with current pipeline
- [ ] deployment order dependencies are understood

### Data / Migration Readiness
- [ ] schema/data changes are identified
- [ ] migration order is defined
- [ ] backward compatibility is considered
- [ ] rollback implications of data changes are known

### Integration Readiness
- [ ] external/internal integrations affected are identified
- [ ] contract changes are clear
- [ ] timeout / retry / failure behavior is considered
- [ ] rate limits / auth / credentials impact is considered where relevant

### Monitoring / Observability Readiness
- [ ] logs needed for validation exist or are planned
- [ ] failure symptoms are known
- [ ] key health signals are defined
- [ ] post-release verification path is clear

### Rollback Readiness
- [ ] rollback is possible
- [ ] rollback steps are understood
- [ ] irreversible changes are identified
- [ ] fallback behavior is known if rollback is partial or delayed

---

## 4. Release Risk Classification

### Low Risk
- limited blast radius
- no migration
- no critical-path behavior
- no sensitive integration impact

### Medium Risk
- moderate workflow impact
- some integration or config dependency
- partial runtime uncertainty
- manageable rollback path

### High Risk
- critical user journey impact
- auth/payment/data risks
- schema migration or infra change
- weak rollback path
- major unknowns

State the release risk explicitly.

---

## 5. Deployment Notes Template

### Deployment Steps
1. [step]
2. [step]
3. [step]

### Required Order
[describe sequencing if important]

### Required Variables / Secrets
[list]

### Migration Steps
[list or N/A]

### Verification After Deploy
- [check]
- [check]
- [check]

### Rollback Steps
1. [step]
2. [step]
3. [step]

### Known Release Risks
- [risk]
- [risk]

---

## 6. Post-Release Validation

After release, confirm:
- [ ] service is reachable
- [ ] core user journey works
- [ ] expected logs / metrics are visible
- [ ] no obvious error spike exists
- [ ] affected integrations behave as expected
- [ ] business-critical path is healthy

For critical changes, define a short observation window and expected success signals.

---

## 7. Decision Rule

A release is ready only if:
- the implementation is understood
- environment needs are known
- runtime risks are visible
- rollback thinking exists
- verification after deploy is planned

If any of these are missing, say the release is not truly ready yet.

Do not confuse “code complete” with “release ready”.
