# REVIEW_CHECKLIST.md
## Critical Review and Self-Challenge Checklist

This checklist is used to reduce self-confirmation risk in a process-based single-agent system.

The project agent must use this checklist for medium and large tasks before concluding work.

---

## 1. Problem / Scope Review
- [ ] Did I solve the real problem, not just the surface request?
- [ ] Is the scope boundary clear?
- [ ] Did I accidentally add unrelated work?
- [ ] Did I exclude any must-have requirement?

---

## 2. Design Review
- [ ] Is the chosen approach consistent with project constraints?
- [ ] Did I consider at least one plausible alternative?
- [ ] Is there overengineering?
- [ ] Is there under-design that creates hidden future risk?
- [ ] Does this fit the maturity of the actual project?

---

## 3. Implementation Review
- [ ] Does the implementation match the intended design?
- [ ] Are changes focused and understandable?
- [ ] Did I introduce avoidable complexity?
- [ ] Did I create coupling or duplication that should be noted?

---

## 4. Verification Review
- [ ] What if my main assumption is wrong?
- [ ] What breaks at the boundaries?
- [ ] What shared areas might regress?
- [ ] What remains unproven without runtime validation?
- [ ] Did I only reason about happy paths?

---

## 5. Operational Review
- [ ] What could fail in deployment?
- [ ] Are env/config needs clear?
- [ ] Is rollback plausible?
- [ ] Are logging/observability needs addressed?
- [ ] Is there a user-facing failure mode I am underestimating?

---

## 6. Business Review
- [ ] Does this fit business urgency?
- [ ] Is this too slow/heavy for the current need?
- [ ] Is this too fragile for the business criticality?
- [ ] Did I optimize elegance over practical delivery without justification?

---

## 7. Required Critique Output

For meaningful tasks, produce:

### What I am confident about
[items]

### What may be wrong
[items]

### What still needs validation
[items]

### What I would check next in a real environment
[items]
