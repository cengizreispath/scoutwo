# REPO_STRUCTURE_EXAMPLE.md
## Suggested Repository Layout

Below is the recommended hierarchy for combining the process-based AI system with project memory and active execution memory.

```txt
scoutwo/
├── ai-system/
│   ├── 00-core/
│   │   ├── SYSTEM.md
│   │   ├── EXECUTION_MODEL.md
│   │   └── OUTPUT_CONTRACT.md
│   ├── 10-project-memory/
│   │   ├── PROJECT_BRIEF.md
│   │   ├── PROJECT_CONTEXT.md
│   │   ├── DECISION_LOG.md
│   │   ├── KNOWN_RISKS.md
│   │   └── DOMAIN_RULES.md
│   ├── 15-execution/
│   │   ├── ACTIVE_WORK.md
│   │   └── PROGRESS_REPORTING.md
│   ├── 20-process/
│   │   ├── PHASE_01_UNDERSTAND.md
│   │   ├── PHASE_02_FRAME.md
│   │   ├── PHASE_03_DESIGN.md
│   │   ├── PHASE_04_IMPLEMENT.md
│   │   ├── PHASE_05_VERIFY.md
│   │   ├── PHASE_06_RELEASE.md
│   │   └── PHASE_07_LEARN.md
│   ├── 30-quality/
│   │   ├── TEST_STRATEGY.md
│   │   ├── RELEASE_CHECKLIST.md
│   │   ├── REVIEW_CHECKLIST.md
│   │   └── CRITIC_MODES.md
│   └── 99-examples/
│       └── REPO_STRUCTURE_EXAMPLE.md
├── src/
├── infra/
├── docker-compose.yml
└── README.md
```

## Intent of the Layers

### `ai-system/00-core`
Defines the operating model of the project agent.

### `ai-system/10-project-memory`
Stores relatively stable project truth such as business intent, runtime context, and durable decisions.

### `ai-system/15-execution`
Stores short-lived active execution context and progress reporting rules.

### `ai-system/20-process`
Defines the execution phases.

### `ai-system/30-quality`
Defines verification, critique, release, and specialist review rules.

### `ai-system/99-examples`
Provides examples and optional reference material.

## Practical Note

You may start with fewer files if needed.
For example, you may initially use a single `CONTEXT.md`.
But for long-running projects, the split between:
- `PROJECT_CONTEXT.md`
- `ACTIVE_WORK.md`
- `KNOWN_RISKS.md`

usually leads to cleaner context management and better agent behavior.
