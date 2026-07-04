# QA Automation Artifacts — PharmaConnect v2.0

Location: `docs/qa-evidence/` for artifacts; `references/qa-test-cases.md` for reproduction steps.

## Runner Entry

Use `scripts/qa-runner.py` to execute browser automation and API checks.
Expected output JSON shape:
- { tcid, name, status: pass/fail/blocked, evidence_path?, error? }

## Evidence Files

- TC-01: screenshots/otp-rate-limit.png
- TC-02: screenshots/auth-link.png
- TC-03: data/request-expiry.json
- TC-04: data/reservation-race.json
- TC-05: screenshots/hold-expiry.png
- TC-06: data/illegal-transition.json
- TC-07: data/document-partial-approval.json
- TC-08: data/tva-computation.json
- TC-09: data/payment-replay.json
- TC-10: data/account-deletion-cascade.json
- TC-11: data/waiting-list-expiry.json
- TC-12: data/multi-branch-scoping.json

## Browser Automation Scripts

Place under `scripts/qa-browser/` when building.
Required scripts:
- qa-otp-flow.ts
- qa-pharmacy-dashboard.ts
- qa-patient-request.ts
- qa-admin-review.ts
- qa-payment-webhook.ts

## API Regression Scripts

Place under `scripts/qa-api/`.
Required scripts:
- qa-auth.sh
- qa-requests.sh
- qa-reservations.sh
- qa-payments.sh
- qa-admin.sh

## Gate Policy
- After every merge to main, run TC-01 through TC-12.
- Any failing TC blocks release.
- Evidence archived with commit hash and environment used.
