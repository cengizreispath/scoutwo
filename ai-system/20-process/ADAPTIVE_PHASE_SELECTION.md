# ADAPTIVE_PHASE_SELECTION.md
## Adaptive Phase Selection and Replanning Model

The system must not assume that every task needs every phase.
A fixed phase catalog is useful.
A fixed phase path is not.

Use an adaptive model:
- the phase library is stable
- the actual phase path is selected per task
- an initial plan is required
- replanning after each phase is expected

## Mandatory Planning Step
After the initial understanding pass, create an initial execution plan.

Include:
- task type
- intended deliverable
- chosen workflow pattern
- selected phases
- skipped phases
- skip rationale
- success criteria
- risk level

## Path-Dependent Completion
A task is complete when its selected execution path is complete.

**A task is complete when its selected path is complete, not when every possible phase has run.**
