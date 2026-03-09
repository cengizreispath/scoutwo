# REPO_STRUCTURE_EXAMPLE.md

```txt
scoutwo/
├── ai-system/
│   ├── 00-core/
│   │   ├── SYSTEM.md
│   │   ├── EXECUTION_MODEL.md
│   │   ├── OUTPUT_CONTRACT.md
│   │   └── WORKFLOW_PATTERNS.md
│   ├── 10-project-memory/
│   │   ├── PROJECT_BRIEF.md
│   │   ├── PROJECT_CONTEXT.md
│   │   ├── DECISION_LOG.md
│   │   └── KNOWN_RISKS.md
│   ├── 15-execution/
│   │   ├── ACTIVE_WORK.md
│   │   └── PROGRESS_REPORTING.md
│   ├── 20-process/
│   │   ├── PHASE_LIBRARY.md
│   │   ├── ADAPTIVE_PHASE_SELECTION.md
│   │   └── TASK_CLASSIFICATION.md
│   ├── 30-quality/
│   │   ├── TEST_STRATEGY.md
│   │   ├── RELEASE_CHECKLIST.md
│   │   ├── REVIEW_CHECKLIST.md
│   │   └── CRITIC_MODES.md
│   └── 99-examples/
│       └── REPO_STRUCTURE_EXAMPLE.md
├── src/
├── infra/
└── ...
```

If the team prefers starting with a single `CONTEXT.md`, that is acceptable initially.
Longer term, split into:
- PROJECT_CONTEXT.md
- ACTIVE_WORK.md
- KNOWN_RISKS.md
