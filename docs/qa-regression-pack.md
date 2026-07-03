# QA Regression Pack — PharmaConnect v2.0

This pack provides the executable browser/API regression for the release gate.

## How to Execute

```bash
# browser QA
hermes /qa --url https://pharmaconnect.example.com --tests references/qa-test-cases.md

# API QA
hermes /qa-only --api-base https://api.pharmaconnect.example.com --tests frontend/api/cases/
```

## Evidence Format

For each TC-NN create a markdown file:
`docs/qa-evidence/TC-NN-<name>.md`

Contents:
- Status: passed|failed
- Steps executed (free text)
- Before screenshot: `docs/qa-evidence/TC-NN-before.png`
- After screenshot: `docs/qa-evidence/TC-NN-after.png`
- API request/response payloads (redacted secrets)
- Notes

## pass/fail Rules

- Failure on any TC-NN blocks release
- Flake must be isolated: rerun same TC 3 times in clean environment
- Security TC-NN (05, 06, 09, 10) require `/cso` sign-off before `/ship`

## Triage

When TC fails:
1. Classify: env issue / regression / prior bug
2. Open ticket in handoff board with reproduction trace
3. Send ticket owner + link to evidence file

## Expected Runtime

- Dry run: 10-20 min
- Full regression with screenshots: 30-60 min
