# Worker release package — PharmaConnect v2.0

This package is what you deploy to Cloudflare Workers.
Building this package is a local-only command and does not require Xano.

## Package layout expected by CI
- infra/worker/package.json
- infra/worker/wrangler.toml
- infra/worker/wrangler.toml.template
- infra/worker/build/web/*
- infra/worker/src/index.ts
- infra/worker/src/handlers/payment-webhook.ts
- infra/types/index.ts
- infra/types/package.json

## Local assembly commands
```bash
cd /home/deploy/pharmaconnect/infra/worker
npm ci
mkdir -p build/web
cp /path/to/flutterflow/web/export/* build/web/
cp wrangler.toml.template wrangler.toml
wrangler deploy
```

## CI deploy trigger
- Push to main runs `.github/workflows/deploy-worker.yml`.
- Secrets required: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, XANO_API_TOKEN.
- Variable required: XANO_API_URL.

## Verification after deploy
```bash
curl -sS https://<worker-host>/health
```
Expected: `ok`
