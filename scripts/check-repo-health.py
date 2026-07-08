#!/usr/bin/env python3
"""
PharmaConnect repo pre-flight check.
Verifies expected docs, code, and CI files exist without external network calls.
"""
from pathlib import Path

PHARMA_DIR = Path("/home/deploy/pharmaconnect")

CHECKS = [
    "CLAUDE.md",
    "handoff.md",
    "backend/xano/schema.sql",
    "backend/xano/api-groups-setup.md",
    "backend/xano/implementation-execution.md",
    "backend/xano/seed/01-organization.sql",
    "backend/xano/seed/02-users.sql",
    "backend/xano/seed/03-documents.sql",
    "backend/xano/seed/04-active-flow.sql",
    "backend/xano/seed/05-subscriptions.sql",
    "frontend/flutterflow/code-snippets.md",
    "frontend/flutterflow/screen-map.md",
    "frontend/flutterflow/types/pharmaconnect.d.ts",
    "infra/worker/src/index.ts",
    "infra/worker/src/handlers/payment-webhook.ts",
    "infra/worker/wrangler.toml.template",
    "infra/worker/package.json",
    "infra/types/index.ts",
    "infra/types/package.json",
    "scripts/qa-runner.py",
    "scripts/run-qa-local.py",
    "docs/playground/curl-commands.md",
    "docs/integration-runbook.md",
    "docs/frontend-backend-mapping.md",
    "docs/frontend-error-glossary.md",
    "docs/flutterflow-project-setup.md",
    "docs/release-checklist.md",
    "docs/demo-script.md",
    "docs/worker-release-package.md",
    ".github/workflows/verify.yml",
    ".github/workflows/deploy-worker.yml",
]

missing = []
for rel in CHECKS:
    if not (PHARMA_DIR / rel).exists():
        missing.append(rel)

if missing:
    print("MISSING:")
    for m in missing:
        print(f" - {m}")
    raise SystemExit(2)

print("OK: all checked files are present.")
