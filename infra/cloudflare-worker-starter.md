# Cloudflare Workers Starter — PharmaConnect v2.0

Static asset host for FlutterFlow web build + API proxy cache.

## Setup

```bash
npm create cloudflare@latest pharmaconnect-web
cd pharmaconnect-web
npm install @cloudflare/kv-asset-handler wrangler
```

## wrangler.toml

```toml
name = "pharmaconnect-web"
main = "src/index.ts"
compatibility_date = "2025-07-01"
account_id = "__CLOUDFLARE_ACCOUNT_ID__"

[site]
bucket = "./build/web"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "ASSETS"
id = "__KV_NAMESPACE_ID__"
```

## src/index.ts

```typescript
import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

interface Env {
  ASSETS: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return new Response('ok', { status: 200 });
    }

    // API proxy to Xano (optional cache layer)
    if (url.pathname.startsWith('/api/')) {
      const apiUrl = `https://your-xano-instance.xano.com${url.pathname.replace('/api/', '')}`;
      const apiRequest = new Request(apiUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
      });
      const apiResponse = await fetch(apiRequest);
      return new Response(apiResponse.body, apiResponse);
    }

    // Static asset
    try {
      const cachedAsset = await getAssetFromKV(env.ASSETS, request);
      return cachedAsset;
    } catch (e) {
      // Fallback to SPA route for FlutterFlow web
      const asset = await mapRequestToAsset(request, env.ASSETS);
      return asset;
    }
  },
};
```

## Deploy Script

```bash
wrangler secret put CLOUDFLARE_API_TOKEN
wrangler secret put XANO_API_TOKEN
wrangler deploy
```

## Build Steps
1. Export FlutterFlow web build to `build/web`
2. Run `wrangler deploy`
3. Bind custom domain in Cloudflare dashboard

## CI Integration
Use .github/workflows/deploy.yml with secrets:
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
- XANO_API_TOKEN
