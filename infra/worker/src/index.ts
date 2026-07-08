import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

export interface Env {
  ASSETS: KVNamespace;
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' } as const;

function corsAndSecurityHeaders(origin: string): Record<string, string> {
  return {
    'access-control-allow-origin': origin || '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-max-age': '86400',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
  };
}

function auditLog(env: Env, action: string, payload: Record<string, unknown> | undefined): void {
  try {
    // Fire-and-forget structured log from Worker context.
    // Replace with env.LOGGER or external endpoint if needed.
    console.log(JSON.stringify({ action, payload }));
  } catch {}
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsAndSecurityHeaders(origin) });
    }

    // Health check
    if (url.pathname === '/health') {
      auditLog(env, 'worker.health', { path: url.pathname });
      return new Response('ok', {
        status: 200,
        headers: { ...corsAndSecurityHeaders(origin), 'cache-control': 'no-store' },
      });
    }

    // API proxy to Xano
    if (url.pathname.startsWith('/api/')) {
      const apiUrl = `${env.XANO_API_URL}${url.pathname.replace('/api/', '/')}`;
      const init: RequestInit = {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
      };
      const apiResponse = await fetch(apiUrl, init);
      const responseHeaders = new Headers(apiResponse.headers);
      Object.entries(corsAndSecurityHeaders(origin)).forEach(([k, v]) => responseHeaders.set(k, v));

      auditLog(env, 'worker.api_proxy', {
        path: url.pathname,
        status: apiResponse.status,
      });

      return new Response(apiResponse.body, {
        status: apiResponse.status,
        headers: responseHeaders,
      });
    }

    // Static asset
    try {
      const cachedAsset = await getAssetFromKV(env.ASSETS, request);
      const responseHeaders = new Headers(cachedAsset.headers);
      Object.entries(corsAndSecurityHeaders(origin)).forEach(([k, v]) => responseHeaders.set(k, v));
      return new Response(cachedAsset.body, {
        status: cachedAsset.status,
        headers: responseHeaders,
      });
    } catch (e) {
      // Fallback to SPA route for FlutterFlow web
      const asset = await mapRequestToAsset(request, env.ASSETS);
      const responseHeaders = new Headers(asset.headers);
      Object.entries(corsAndSecurityHeaders(origin)).forEach(([k, v]) => responseHeaders.set(k, v));
      return new Response(asset.body, {
        status: asset.status,
        headers: responseHeaders,
      });
    }
  },
};
