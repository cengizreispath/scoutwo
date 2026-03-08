# TEST_STRATEGY.md
## Integrated Verification Strategy

Testing is an execution phase, not a separate fictional department.

The purpose of this document is to define how changes are evaluated for correctness, regression risk, and release confidence.

The project agent must use this document to shape verification work before declaring a change complete.

---

## 1. Test Philosophy

The goal of testing is not to maximize test volume.
The goal is to reduce meaningful delivery risk.

Every change should be evaluated through these questions:
1. What is supposed to work?
2. What could break because of this change?
3. What edge cases matter?
4. What regressions are plausible?
5. What cannot be proven without runtime validation?

Testing must scale with change risk.

---

## 2. Risk-Based Test Depth

### Low-Risk Changes
Examples:
- copy/text changes
- styling-only changes with no behavioral impact
- safe configuration updates with low blast radius
- local refactors with no behavior change

Expected verification:
- static review
- basic regression awareness
- smoke validation where applicable

### Medium-Risk Changes
Examples:
- feature enhancements
- logic changes in existing flows
- API response changes
- form behavior changes
- integration adjustments

Expected verification:
- scenario-based functional checks
- edge case review
- regression identification
- environment-specific considerations

### High-Risk Changes
Examples:
- authentication
- payment
- checkout
- data mutation logic
- migrations
- infrastructure changes
- caching/session changes
- permissions
- production runtime behavior changes

Expected verification:
- adversarial review
- negative cases
- rollback awareness
- stronger manual/automated validation
- deployment safety review
- monitoring plan

---

## 3. Verification Layers

### A. Requirement Verification
Check whether the change satisfies:
- the original problem
- defined scope
- acceptance criteria
- business rules

### B. Functional Verification
Check whether:
- the intended path works
- the affected components behave correctly
- the output matches expected behavior

### C. Edge Case Verification
Check:
- null / empty / missing states
- invalid inputs
- boundary conditions
- partial failure scenarios
- duplicate or repeated actions
- timeout or retry paths where relevant

### D. Regression Verification
Check what else may have been affected:
- shared utilities
- reused components
- dependent integrations
- nearby workflows
- config or environment coupling

### E. Operational Verification
Check:
- logging visibility
- deploy assumptions
- env variable dependencies
- migration needs
- runtime failure modes
- rollback feasibility

---

## 4. Test Case Design Rules

For each meaningful change, define test scenarios in this structure:

### Scenario
[What is being tested]

### Preconditions
[What must already be true]

### Action
[What the user/system does]

### Expected Result
[What should happen]

### Risk Level
Low | Medium | High

### Notes
[Special cases, caveats, environment limits]

---

## 5. Minimum Verification Output

For every meaningful task, the project agent should provide at least:

### What was checked
[Actual reviewed or tested areas]

### What is assumed but not proven
[Static assumptions or environment dependencies]

### What could still fail
[Remaining risks]

### What should be tested next in a real environment
[Recommended manual or automated follow-up]

---

## 6. When Runtime Access Is Not Available

If the agent cannot run the software or access the environment:
- state that clearly
- do not fake execution
- provide the most credible static verification possible
- generate realistic test scenarios
- identify runtime-only risk areas
- recommend the next best validation sequence

Never imply that something was tested if it was only reasoned about.

---

## 7. Regression Thinking Rules

Always ask:
- what existing behavior might this accidentally alter?
- what shared modules are touched?
- what assumptions are coupled to this code?
- what consumers depend on this output?
- what environment-specific behavior could differ?

Regression thinking is mandatory for medium and high-risk work.

---

## 8. Negative Testing

Do not only test happy paths.

For relevant changes, consider:
- invalid input
- missing dependencies
- unauthorized access
- broken integration responses
- race conditions
- repeated submissions
- partially completed states
- malformed data
- degraded network or slow responses

---

## 9. Evidence Standard

Verification should prefer evidence in this order:
1. executed automated tests
2. executed manual validation
3. runtime logs / observable behavior
4. static reasoning against code and architecture
5. documented assumptions

If only lower-confidence evidence exists, say so explicitly.

---

## 10. Release Confidence Levels

### High Confidence
- acceptance criteria covered
- regression surface examined
- runtime validation exists or risk is minimal
- operational considerations are addressed

### Medium Confidence
- logic is coherent
- static review is solid
- some runtime validation is missing
- moderate residual risk exists

### Low Confidence
- environment assumptions are unverified
- edge cases are weakly covered
- deployment impact is unclear
- meaningful uncertainty remains

The project agent should state confidence honestly.

---

## 11. Output Format for Verification

Use this structure when useful:

### Verification Summary
[Concise result]

### Scenarios Covered
- [scenario]
- [scenario]

### Remaining Risks
- [risk]
- [risk]

### Confidence Level
High | Medium | Low

### Recommended Next Checks
- [next check]
- [next check]
