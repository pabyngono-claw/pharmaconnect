# PharmaConnect — Agent Handoff

Use this file to prevent invisible work and context loss when agents pass work between roles.

## Card Schema

Every work item uses this shape:

```json
{
  "id": "agent-card-001",
  "title": "Build dynamic workflow skill",
  "owner": "codex",
  "state": "running",
  "branch": "product/dynamic-workflow-team-orchestration",
  "worktree": ".",
  "acceptance": [
    "Skill exists",
    "Tests cover required concepts",
    "Content artifact contains video and article angles"
  ],
  "merge_gate": "lint, focused tests, and catalog check pass",
  "handoff": "path/to/handoff.md"
}
```

## Agent Kanban

| Column | Meaning | Exit Criteria |
|--------|---------|---------------|
| Backlog | Candidate, not yet shaped | Acceptance criteria written |
| Ready | Shaped and assignable | Owner and branch/worktree assigned |
| Running | Agent actively working | Handoff artifact and changed files exist |
| Review | Complete but not merged | Tests pass, diff review and risk check pass |
| Blocked | Needs external input or failed gate | Blocker has owner and next action |
| Merged | Integrated into mainline | PR merged or local main updated |
| Archived | No longer relevant | Reason recorded |

## Workflow

1. Shape the board: convert fuzzy ambition into work items with owners and merge gates.
2. Assign boundaries: one owner per card, clear file scope, no overlapping writes without an integrator.
3. Run agents: each agent writes evidence and handoff notes, not just code.
4. Review in sequence: tests first, then diff review, then security/risk checks, then product polish.
5. Merge deliberately: one integrator resolves conflicts and updates this file.
6. Extract reusable skill: if the card pattern repeats, promote it into `skills/`.

## PharmaConnect Current Board

| ID | Title | Owner | State | Branch | Acceptance | Merge Gate |
|-----|-------|-------|-------|--------|------------|-----------|
| PC-01 | Define design tokens and component-color status mapping | designer | merged | design/tokens-2026 | Color map complete, no emoji rule validated, skeleton layouts approved | `/design-review` passes, contrast >= 4.5:1 |
| PC-02 | Lock 21-table schema in Xano | eng-manager | running | eng/xano-schema-v2 | All 21 tables created, indexes valid, TVA server-side rule enforced | `/plan-eng-review` + API contract dry-run |
| PC-03 | Implement reservation state machine | backend | running | eng/reservation-state-machine | SUBMITTED/READY terminal states enforced, illegal transition returns 422 | `/qa` TC-04 through TC-06 pass |
| PC-04 | Build patient request + pharmacy selection screen | frontend-lead | ready | frontend/request-flow | Accessibility targets >= 48x48dp, offline behavior defined, loading skeleton matches real row | `/plan-design-review` >= 8/10, `/qa` TC-01/03 pass |
| PC-05 | Implement OTP + OAuth custom auth | backend | ready | eng/custom-auth | OTP hashed, 5-min expiry, 3-per-phone-10-min rate limit, refresh tokens rotated | `/cso` auth audit, `/investigate` on lockout scenarios |
| PC-06 | Payment webhook idempotency (Orange Money + Wave) | backend | ready | eng/payment-idempotency | provider_transaction_id unique, replay returns existing record, no duplicate charges | `/cso` payment audit, `/qa` TC-09 pass |
| PC-07 | Admin approval workflow for pharmacies | frontend-lead | ready | frontend/admin-approval | Document tiles, per-document approve/reject, resubmit only rejected docs | `/qa` TC-07 pass |
| PC-08 | QA regression pack | qa-lead | ready | qa/regression-pack | TC-01 through TC-12 executable, browser evidence for each, before/after screenshots | `/qa` full pass |
| PC-09 | Release Cloudflare Workers + CI pipeline | release-engineer | ready | release/cf-workers-ci | Environment config, rollback plan, health check endpoint | `/ship` + `/land-and-deploy` |
| PC-10 | Document release runbook | docs-lead | ready | docs/release-runbook | API docs, onboarding, changelog, admin runbooks aligned with shipped schema | `/document-release` |

## Handoff Artifact Requirements

Finish each card with:
- What shipped (files, endpoints, screens)
- Tests and eval evidence
- Blockers with owner and next action
- New reusable workflow/skill candidates

## Failure Modes To Watch

- Agent soup: many agents running, no owner or merge gate
- Invisible work: useful output only in chat transcript
- Board theater: Kanban exists but cards lack acceptance criteria
- Overlapping writes: parallel agents edit same files without worktrees
- No product artifact: process produces docs but no runnable or publishable surface
