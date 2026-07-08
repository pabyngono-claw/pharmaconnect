# Cloudflare Worker Deployment — PharmaConnect v2.0

This Worker hosts the FlutterFlow web build and proxies API calls to Xano.
It also exposes idempotent payment webhook endpoints for Orange Money and Wave.

## Prerequisites
- Node.js 18+
- Wrangler CLI installed: `npm install -g wrangler`
- Cloudflare account with Workers + KV
- Xano workspace reachable from Worker runtime

## Local secrets
Set secrets with `wrangler secret put`:
- `XANO_API_URL`
- `XANO_API_TOKEN`
- `WEBHOOK_PROVIDER_SECRETS` — JSON mapping provider names to shared secrets

 # Example value
 # {"orange_money":"...","wave":"..."}

## KV namespace
Create a KV namespace for assets:
```bash
wrangler kv namespace create ASSETS
```
Copy the returned `id` into `wrangler.toml` under `[[kv_namespaces]]`.

## Configuration
1. Copy `wrangler.toml.template` to `wrangler.toml`
2. Replace `__CLOUDFLARE_ACCOUNT_ID__` and `__KV_NAMESPACE_ID__`
3. Keep `XANO_API_URL` in `[vars]` or omit because secret is preferred

## Deploy
```bash
cd /home/deploy/pharmaconnect/infra/worker
npm ci
wrangler deploy
```

## Verify
```bash
curl -sS https://<worker-host>/health
```

Expected: `ok`

## Webhook smoke test
```bash
curl -sS -X POST 'https://<worker-host>/webhooks/payments/orange_money' \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer $WEBHOOK_PROVIDER_SECRETS_ORANGE_MONEY' \
  -d '{"provider_transaction_id":"deploy-test-001","status":"succeeded","amount":1000}'
```

## CI deploy
On push to `main`, `.github/workflows/deploy-worker.yml` deploys automatically.
Required GitHub repo secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `XANO_API_TOKEN`

Required GitHub repo variables:
- `XANO_API_URL`

## SPA hosting
Place FlutterFlow web export in `build/web` before deploy.
The Worker falls back to `mapRequestToAsset` for client-side routing.
