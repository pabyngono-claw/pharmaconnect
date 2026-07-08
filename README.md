# PharmaConnect v2.0

Senegal-focused pharmacy connectivity platform.
Patients submit prescription/product requests, pharmacies respond, reservations manage the handoff.

## Stack
- Backend: Xano (schema, API groups, scheduled jobs, webhooks)
- Frontend: FlutterFlow (patient, pharmacy, admin apps) + FlutterFlow web build
- Hosting: Cloudflare Worker for web + Xano proxy + payment webhooks
- QA: `scripts/qa-runner.py` with markdown evidence output

## Repo Structure

```
pharmaconnect/
├── CLAUDE.md
├── handoff.md
├── README.md
├── .gitignore
├── .env.example
├── references/
│   ├── schema-full.md
│   ├── api-contracts.md
│   └── qa-test-cases.md
├── backend/
│   └── xano/
│       ├── schema.sql
│       ├── api-groups-setup.md
│       ├── implementation-execution.md
│       ├── scheduled-jobs-execution.md
│       ├── webhook-contract.md
│       ├── seed/
│       │   ├── README.md
│       │   ├── 01-organization.sql
│       │   ├── 02-users.sql
│       │   ├── 03-documents.sql
│       │   ├── 04-active-flow.sql
│       │   └── 05-subscriptions.sql
│       └── references/
├── frontend/
│   └── flutterflow/
│       ├── code-snippets.md
│       ├── screen-map.md
│       ├── screen-specs.md
│       └── types/pharmaconnect.d.ts
├── infra/
│   ├── types/
│   │   ├── package.json
│   │   └── index.ts
│   └── worker/
│       ├── README.md
│       ├── package.json
│       ├── wrangler.toml.template
│       ├── src/
│       │   ├── index.ts
│       │   └── handlers/
│       │       └── payment-webhook.ts
│       └── build/web/ (FlutterFlow web build output)
├── scripts/
│   ├── qa-runner.py
│   ├── run-qa-local.py
│   ├── check-repo-health.py
│   └── scheduled-tasks/
├── docs/
│   ├── security-review.md
│   ├── release-runbook.md
│   ├── environment-secrets-checklist.md
│   ├── qa-evidence/
│   ├── playground/
│   │   └── curl-commands.md
│   ├── integration-runbook.md
│   ├── frontend-backend-mapping.md
│   ├── frontend-error-glossary.md
│   ├── flutterflow-project-setup.md
│   ├── release-checklist.md
│   ├── demo-script.md
│   └── worker-release-package.md
└── .github/
    └── workflows/
        ├── verify.yml
        └── deploy-worker.yml
```

## Local Setup

```bash
git clone <url> pharmaconnect
cd pharmaconnect
cp .env.example .env
python3 scripts/check-repo-health.py
python3 scripts/run-qa-local.py --base-url <xano-api> --token <token>
```

## Quick Links

- Integration runbook: `docs/integration-runbook.md`
- Front/Back mapping: `docs/frontend-backend-mapping.md`
- Release checklist: `docs/release-checklist.md`
- CI: `.github/workflows/`

## Standards

See `.claude/skills/gstack/SKILL.md` for team workflow and available slash commands.
See `CLAUDE.md` for stack, routing rules, and quality standards.

## Current Board

See `handoff.md` for the agent Kanban board (PC-01..PC-10).
