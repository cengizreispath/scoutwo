# TASK_CLASSIFICATION.md
## Task Classification and Default Paths

Classify first.
Plan second.
Adapt continuously.

## Classification Output
After the first understanding pass, produce:

### Task Classification
- primary type
- secondary tags
- expected deliverable
- risk level

### Workflow Pattern
- chosen pattern
- why it fits

### Default Path
- selected phases
- likely skipped phases
- why this path fits

### Completion Definition
- this task is complete when: [conditions]

## Task Type Catalog

### Analysis
Default pattern:
- Single Agent
Default path:
- Understand
- Frame
- Investigate
- Synthesize
- Recommend
- Learn

### Feature Implementation
Default pattern:
- Single Agent
Optional:
- Evaluator-Optimizer for high-risk or high-quality demands
- Sequential if hard stage dependencies exist
Default path:
- Understand
- Frame
- Design
- Implement
- Verify
- Release Review
- Learn

### Migration
Default pattern:
- Sequential
Optional:
- Evaluator-Optimizer for plan quality
Default path:
- Understand
- Frame
- Investigate
- Design
- Migration Review
- Implement
- Verify
- Release Review
- Deploy Support
- Learn

### Infrastructure Diagnosis
Default pattern:
- Single Agent
Optional:
- Parallel evidence gathering
Default path:
- Understand
- Frame
- Investigate
- Diagnose
- Risk Review
- Recommend or Implement
- Verify
- Learn

### Documentation
Default pattern:
- Single Agent
Optional:
- Evaluator-Optimizer for important docs
Default path:
- Understand
- Frame
- Investigate
- Synthesize
- Implement
- Documentation Review
- Learn
