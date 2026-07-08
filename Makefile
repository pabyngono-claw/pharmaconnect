.PHONY: help health qa verify worker-secrets worker-package lint-docs

help:
	@printf "PharmaConnect v2.0 make targets:\n"
	@printf "  health           - Run repo structure checks\n"
	@printf "  qa               - Run QA runner (needs .env)\n"
	@printf "  verify           - Run markdown link checks\n"
	@printf "  lint-docs        - Basic markdown hygiene\n"
	@printf "  worker-package   - Display Worker deploy assembly steps\n"

health:
	python3 scripts/check-repo-health.py

qa:
	python3 scripts/run-qa-local.py

verify:
	npx --yes markdown-link-check docs/playground/curl-commands.md docs/integration-runbook.md docs/frontend-backend-mapping.md docs/frontend-error-glossary.md docs/flutterflow-project-setup.md docs/release-checklist.md docs/demo-script.md docs/worker-release-package.md README.md handoff.md || true

lint-docs:
	@find docs frontend backend scripts infra -type f -name '*.md' -print0 | xargs -0 -I{} sh -c 'wc -l "{}"'

worker-package:
	@printf "Worker deploy assembly:\n"
	@printf "1. cd infra/worker && npm ci\n"
	@printf "2. mkdir -p build/web && cp flutterflow-web-export/* build/web/\n"
	@printf "3. cp wrangler.toml.template wrangler.toml and edit account_id + kv_namespace id\n"
	@printf "4. wrangler secret put XANO_API_URL\n"
	@printf "5. wrangler secret put XANO_API_TOKEN\n"
	@printf "6. wrangler secret put WEBHOOK_PROVIDER_SECRETS\n"
	@printf "7. wrangler deploy\n"

