# TEST_STRATEGY.md
## Integrated Verification Strategy

Testing is an execution phase, not a separate fictional department.

For every meaningful change, ask:
1. What should work?
2. What could break?
3. What edge cases matter?
4. What regressions are plausible?
5. What cannot be proven without runtime validation?

## Minimum Verification Output
For meaningful work provide:
- what was checked
- what is assumed but not proven
- what could still fail
- what should be tested next in a real environment

Never imply execution if it was only reasoned about.
