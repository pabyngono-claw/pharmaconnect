# Changelog — PharmaConnect v2.0

## [unreleased] — August 2026

### Added
- Integration runbook: FlutterFlow + Worker + Xano assembly and deployment flow.
- Front/Back schema mapping matrix for screen-to-endpoint wiring.
- Frontend error glossary: French user-facing messages mapped from backend error codes.
- FlutterFlow project setup checklist: bundle IDs, Firebase, store metadata placeholders.
- Release checklist: Alpha / Beta / Production go/no-go criteria.
- Demo script with acceptance criteria for stakeholders.
- Worker release package guide with local assembly steps.
- Repo pre-flight check script (`scripts/check-repo-health.py`).
- Makefile with `health`, `qa`, `verify`, `lint-docs`, and `worker-package` targets.
- GitHub issue templates and PR template.
- Payment webhook handler for Orange Money and Wave in Cloudflare Worker.

### Changed
- README refreshed to reflect actual repo structure and quick links.
- Board advanced: PC-B16..PC-B25 marked completed in Ready backlog.

### Docs
- Added seed README, scheduled jobs execution guide, webhook contract.
- Added QA runner v2, playground curl commands, local QA wrapper, env example.
- Added shared schema types for Worker and FlutterFlow.
- Added Worker deployment README.