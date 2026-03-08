# AI System Package

This package defines a process-based, single-agent operating model for software delivery.

## Folder Structure

- `00-core/`
  - `SYSTEM.md`: core execution model and behavior rules
  - `CLAUDE_BOOTSTRAP_NOTE.md`: short instruction to give Claude before using the package
- `10-project-memory/`
  - `PROJECT_BRIEF.md`: project intent, scope, priorities, and constraints
  - `DECISION_LOG.md`: ADR-style decision history
  - `PROJECT_CONTEXT.md`: stable technical/runtime/infrastructure context
  - `KNOWN_RISKS.md`: persistent cross-task risk register
- `15-execution/`
  - `ACTIVE_WORK.md`: short-lived current execution context
  - `PROGRESS_REPORTING.md`: state-based pipeline/UI progress reporting
- `30-quality/`
  - `TEST_STRATEGY.md`: integrated testing and verification rules
  - `RELEASE_CHECKLIST.md`: release readiness and operational safety checklist
  - `REVIEW_CHECKLIST.md`: self-critique and review guardrails
  - `CRITIC_MODES.md`: optional specialist review lenses

## Suggested Usage

1. Give Claude the contents of `00-core/CLAUDE_BOOTSTRAP_NOTE.md`.
2. Provide `00-core/SYSTEM.md` as the main operating rule.
3. Fill in `10-project-memory/PROJECT_BRIEF.md` for the specific project.
4. Keep `10-project-memory/DECISION_LOG.md` updated as meaningful decisions are made.
5. Fill in `10-project-memory/PROJECT_CONTEXT.md` with stack, environments, services, and deployment topology.
6. Keep `15-execution/ACTIVE_WORK.md` updated for the currently active work.
7. Use `15-execution/PROGRESS_REPORTING.md` for pipeline/UI callbacks or status telemetry.
8. Use the quality documents during implementation, review, testing, and release.

## Notes

- This package is intentionally process-based rather than role-based.
- The aim is to keep one continuous project intelligence instead of simulating handoffs between fictional departments.
- You can extend the package later with project-specific docs such as:
  - `DOMAIN_RULES.md`
  - `ARCHITECTURE_PRINCIPLES.md`
  - `KNOWN_RISKS.md`
  - `RELEASE_NOTES.md`

## Recommended Repository Layout

See `99-examples/REPO_STRUCTURE_EXAMPLE.md` for the suggested repository hierarchy that combines the AI operating model with project memory, active execution memory, and your real codebase/infra structure.
