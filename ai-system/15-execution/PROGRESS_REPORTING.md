# PROGRESS_REPORTING.md
## Execution Telemetry and UI Progress Model

This document defines how the project agent should report progress to an external pipeline UI or orchestration layer.

The goal is not fake percentage precision.
The goal is state visibility, blockers, and decision transparency.

---

## 1. Reporting Principle

Prefer state-based progress over arbitrary percentages.
A task should communicate:
- current phase
- current intent
- known blockers
- confidence
- whether human input is needed
- release risk if relevant

---

## 2. Canonical States

Use one of these states whenever possible:
- `understanding`
- `framing`
- `designing`
- `implementing`
- `verifying`
- `release_review`
- `blocked`
- `awaiting_human_decision`
- `done`

---

## 3. Suggested Reporting Payload

```json
{
  "task_id": "string",
  "state": "understanding|framing|designing|implementing|verifying|release_review|blocked|awaiting_human_decision|done",
  "summary": "short human-readable summary",
  "current_focus": "what the agent is doing right now",
  "blockers": ["item"],
  "assumptions": ["item"],
  "critic_modes": ["security", "test"],
  "confidence": "low|medium|high",
  "release_risk": "low|medium|high|critical",
  "needs_human_input": true,
  "next_expected_step": "what comes next"
}
```

---

## 4. Human-Facing Update Format

When emitting progress updates, prefer concise language in this pattern:

### Current State
[state]

### Current Focus
[short explanation]

### Blockers
[list or none]

### Confidence
[low/medium/high]

### Next Step
[next expected action]

---

## 5. Reporting Rules

- do not pretend completion if verification is not done
- do not hide blockers behind vague wording
- do not use percentages unless the surrounding system requires them
- if human input is truly required, say what decision is needed
- if no blocker exists, make the next expected step explicit
