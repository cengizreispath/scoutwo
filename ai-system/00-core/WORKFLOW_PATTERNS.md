# WORKFLOW_PATTERNS.md
## Workflow Pattern Selection

### Default Pattern: Single Agent
Use this by default.

### Sequential
Use when later steps depend on outputs of earlier steps.

Examples:
- migrations
- release preparation with gating
- structured implementation with required prior design

### Parallel
Use when branches can be explored independently or multiple critical lenses add value.

Examples:
- multiple architecture options
- security/performance/maintainability critics in parallel
- independent evidence gathering

### Evaluator-Optimizer
Use when the first draft is unlikely to be sufficient and quality can be measurably improved through iteration.

Examples:
- high-risk code generation
- important technical documents
- migration plans

## Pattern Selection Rule
Start with Single Agent. Escalate only if the task shape justifies it.
