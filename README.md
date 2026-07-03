# PharmaConnect v2.0

Senegal-focused pharmacy connectivity platform.
Patients submit prescription/product requests, pharmacies respond, reservations manage the handoff.

## Repo Structure

```
pharmaconnect/
├── CLAUDE.md
├── handoff.md
├── README.md
├── .gitignore
├── references/
│   ├── schema-full.md
│   ├── api-contracts.md
│   └── qa-test-cases.md
├── backend/
│   └── xano/           # Xano exports / API snapshots
├── frontend/
│   └── flutterflow/    # FlutterFlow exports / assets
├── docs/
│   ├── onboarding.md
│   ├── api.md
│   └── changelog.md
├── scripts/
│   └── scheduled-tasks/ # 5 Xano scheduled task definitions
└── .github/
    └── workflows/
        └── deploy.yml
```

## Local Setup

```bash
git clone <url> pharmaconnect
cd pharmaconnect
git checkout -b <feature>
```

## Standards

See `.claude/skills/gstack/SKILL.md` for team workflow and available slash commands.
See `CLAUDE.md` for stack, routing rules, and quality standards.

## Current Board

See `handoff.md` for the agent Kanban board (PC-01..PC-10).
