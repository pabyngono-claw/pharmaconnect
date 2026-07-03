# Onboarding — PharmaConnect v2.0

## What This Repo Is

A scaffold for a Senegal-focused pharmacy connectivity platform.

This repo contains:
- Project wiki: `CLAUDE.md`, handoff.md`
- Product docs: `docs/ceo-review.md`, docs/eng-review.md`, docs/design-consultation.md`, docs/design-review.md`, docs/security-review.md`
- Reference data: `references/schema-full.md`, references/api-contracts.md`, references/qa-test-cases.md`, references/design-tokens.md`
- Build artifacts: `frontend/flutterflow//`, `backend/xano//`
- Infra: `.github/workflows/deploy.yml`
- Scheduled tasks: `scripts/scheduled-tasks/`

## Who Works on What

Frontend lead:
- Reads design tokens in `references/design-tokens.md`
- Reads component specs in `frontend/flutterflow/components.md`
- Reads screen specs in `frontend/flutterflow/screen-specs.md`
- Builds in FlutterFlow; exports assets to `frontend/flutterflow/`

Backend lead:
- Reads schema in `references/schema-full.md`
- Reads state machine in `backend/xano/state-machine.md`
- Reads API in `references/api-contracts.md`
- Implements in Xano; exports OpenAPI snapshot to `backend/xano/`

QA lead:
- Reads test cases in `references/qa-test-cases.md`
- Executes browser + API regression via `/qa`

## CI / CD

- Deploys frontend from GitHub Actions to Cloudflare Pages
- Secrets:
  - CLOUDFLARE_API_TOKEN
  - CLOUDFLARE_ACCOUNT_ID

## Conventions

- Branches follow `/<owner>/<slug>/<date>` pattern
- Use handoff for state changes: backlog -> ready -> running -> review -> merged -> archived
- Do not complete work in chat only; always produce a file artifact
