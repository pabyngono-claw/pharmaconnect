import { IcoPaymentWebhookBody, ProviderEnum, PaymentStatusEnum } from '../../types/index';

export type { IcoPaymentWebhookBody, ProviderEnum, PaymentStatusEnum } from '../../types/index';

export interface WebhookContext {
  xanoBaseUrl: string;
  xanoToken: string;
}

const XANO = (ctx: WebhookContext, path: string, init?: RequestInit) =>
  fetch(`${ctx.xanoBaseUrl}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${ctx.xanoToken}`,
      ...(init?.headers || {}),
    },
  });

export async function handlePaymentWebhook(ctx: WebhookContext, provider: string, raw: unknown): Promise<Response> {
  const body = raw as IcoPaymentWebhookBody;
  if (!body?.provider_transaction_id) {
    return new Response(JSON.stringify({ error: { code: 'bad_request', message: 'provider_transaction_id required' } }), { status: 400 });
  }
  if (!['orange_money', 'wave' ].includes(provider)) {
    return new Response(JSON.stringify({ error: { code: 'bad_request', message: 'unknown provider' } }), { status: 400 });
  }

  const mappedStatus: PaymentStatusEnum = mapProviderStatus(body.status);

  const upsert = await Xano(ctx, '/payment_transactions/upsert', {
    method: 'POST',
    body: JSON.stringify({
      provider_transaction_id: body.provider_transaction_id,
      provider,
      status: mappedStatus,
      amount: body.amount,
      currency: body.currency || 'XOF',
      raw_payload: body.raw || null,
      subscription_id: body.subscription_id || null,
    }),
  });

  const text = await upsert.text();
  if (!upsert.ok) {
    return new Response(JSON.stringify({ error: { code: 'upstream_error', message: text } }), { status: 502 });
  }
  return new Response(text, { status: 200 });
}

function mapProviderStatus(status: string): PaymentStatusEnum {
  const s = status.trim().toLowerCase();
  if (s === 'succeeded' || s === 'success') return 'succeeded';
  if (s === 'failed' || s === 'fail') return 'failed';
  if (s === 'refunded' || s === 'refund') return 'refunded';
  if (s === 'authorized' || s === 'pending') return 'authorized';
  return 'pending';
}
