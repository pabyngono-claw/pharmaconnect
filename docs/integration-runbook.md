# FlutterFlow + Worker + Xano Integration Runbook — PharmaConnect v2.0

This runbook documents the end-to-end wiring for the three frontend-related components.
Goal: build once in FlutterFlow, serve via Worker, talk to Xano through the Worker proxy.

## 1. FlutterFlow build artifacts
- Build command: `flutter build web --release`
- Output directory: `build/web`
- Copy the entire `build/web` directory into `infra/worker/build/web` before deploying.

## 2. Worker configuration
- `wrangler.toml` must have:
  - `name = "pharmaconnect-web"`
  - `compatibility_date` set
  - `[[kv_namespaces]]` binding `ASSETS` with the real KV namespace id
  - `[vars]` optional for `ENVIRONMENT = "production"`
- Environment secrets (CLI):
  - `XANO_API_URL` — Xano API base URL
  - `XANO_API_TOKEN` — Xano API token
  - `WEBHOOK_PROVIDER_SECRETS` — JSON `{"orange_money":"...","wave":"..."}`

## 3. API routing in FlutterFlow
- Preferred base URL in FlutterFlow custom code:
  - Production: `https://<worker-host>/api`
  - Dev fallback: `https://x8ki-letl-twmt.n7.xano.io/api:1uUbbKJp`
- Use the `ApiClient` snippet from `frontend/flutterflow/code-snippets.md` for all HTTP calls.
- Do not hardcode Xano credentials in the app.
- OTP, requests, reservations, pharmacies, documents, jobs, webhooks all go through `/api/...`.

## 4. Webhooks in production
- Provider webhooks point to:
  - `https://<worker-host>/webhooks/payments/orange_money`
  - `https://<worker-host>/webhooks/payments/wave`
- Worker validates the request, forwards to Xano `/webhooks/payments/:provider`, and returns 200.

## 5. Local preview
```bash
cd /home/deploy/pharmaconnect/infra/worker
wrangler dev
```
访问 `http://127.0.0.1:8787` — the Worker serves `build/web` if present, otherwise returns 404 for root.
Use a static file server if you need to test FlutterFlow web without Worker:
```bash
python3 -m http.server 8080 --directory build/web
```

## 6. Environment-specific behavior
- `ENVIRONMENT=production` in Worker: stricter security headers, no debug routes.
- FlutterFlow flavors:
  - Use `--dart-define=API_BASE_URL=...` at build time if you must switch base URLs without code changes.

## 7. QA evidence after deploy
- Run:
  ```bash
  python scripts/run-qa-local.py
  ```
- Output files in `docs/qa-evidence/`:
  - `TC-01-otp.md`
  - `TC-08-tva.md`
  - `TC-09-payment.md`
  - `TC-12-multi-branch.md`

## 8. Rollback plan
- Re-deploy previous Worker version via Cloudflare dashboard or `wrangler rollback`.
- Restore previous FlutterFlow web export into `infra/worker/build/web` and redeploy.
- If Xano schema changed, run seed + migration per `backend/xano/implementation-execution.md` rollback section.
