# Payment Webhook Contract — PharmaConnect v2.0

Use this for Orange Money and Wave integration. The handler must be idempotent and provider-agnostic inside the same endpoint.

## Endpoint
POST /webhooks/payments/:provider
Provider path param: orange_money or wave

## Headers
- Content-Type: application/json
- Signature: provider-specific HMAC header if supported
- Idempotency: not required for webhook because provider_transaction_id uniqueness enforces idempotency

## Body Schema
{
  provider_transaction_id: string,
  status: string,
  amount?: decimal,
  currency?: string,
  occurred_at?: timestamp,
  raw?: jsonb
}

Provider status mapping:
- pending -> pending
- authorized -> authorized
- succeeded -> succeeded
- failed -> failed
- refunded -> refunded

If provider does not send status in normalized form, map inside the function before insert.

## Handler Rules
1. Upsert payment_transactions by provider_transaction_id.
2. If inserting, populate:
   - amount from payload or transaction detail fetch
   - currency default XOF unless provided
   - provider from path param
   - raw_payload = entire received payload
3. If updating:
   - Do not downgrade terminal statuses succeeded/refunded/failed unless explicit reconciliation event
   - Record status change in audit_logs changes field
4. If subscription_id is present in payload or can be resolved:
   - Link payment_transaction.subscription_id
   - On succeeded, extend or activate subscription according to plan mapping
5. Always return { transaction_id, status } on success.

## Signature Verification
- Validate HMAC signature using provider secret stored in Xano env vars or Cloudflare secrets
- Reject with 401 if invalid
- Log verification result in audit_logs for security review

## Error Handling
- Malformed body -> 400
- Unknown provider -> 400
- Invalid signature -> 401
- Mapping failure -> 502 with audit log

## Retry Behavior
- Respond 200 as soon as record is stored
- Do not throw transient errors after store succeeds
- Side effects like subscription activation may be async; queue if needed

## Testing
- Replay same webhook payload twice with same provider_transaction_id
- Expected: second response returns existing transaction id unchanged
- Verify no duplicate charge created
