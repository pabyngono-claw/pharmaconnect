# Playground Curl Commands — PharmaConnect v2.0

All commands are copy-pasteable into WSL terminal.
Replace placeholders <> before running.

## Auth smoke
curl -sS -X POST 'https://x8ki-letl-twmt.n7.xano.io/api:1uUbbKJp/auth/otp/request' \
  -H 'content-type: application/json' \
  -d '{"phone":"+221770000001"}'

curl -sS -X POST 'https://x8ki-letl-twmt.n7.xano.io/api:1uUbbKJp/auth/otp/verify' \
  -H 'content-type: application/json' \
  -d '{"phone":"+221770000001","code":"123456"}' | jq

## Create request
curl -sS -X POST 'https://x8ki-letl-twmt.n7.xano.io/api:1uUbbKJp/requests' \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <patient_access_token>' \
  -d '{"product_type":"product","notes":"QA curl","quantity":2}'

## List pharmacies
curl -sS 'https://x8ki-letl-twmt.n7.xano.io/api:1uUbbKJp/pharmacies?near=true&lat=14.7167&lng=-17.4677' | jq

## Create reservation with idempotency
curl -sS -X POST 'https://x8ki-letl-twmt.n7.xano.io/api:1uUbbKJp/reservations' \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <patient_access_token>' \
  -H 'Idempotency-Key: curl-test-001' \
  -d '{"response_id":"70000000-0000-0000-0000-000000000001"}'

## Payment webhook replay + idempotency check
WEBHOOK_URL='https://<worker-host>/webhooks/payments/orange_money'

curl -sS -X POST "$WEBHOOK_URL" \
  -H 'content-type: application/json' \
  -d '{"provider_transaction_id":"replay-001","status":"succeeded","amount":1000}'

curl -sS -X POST "$WEBHOOK_URL" \
  -H 'content-type: application/json' \
  -d '{"provider_transaction_id":"replay-001","status":"failed","amount":1000}'

Expected second call returns the same transaction_id with earlier status unchanged.

## Admin approval
curl -sS -X POST 'https://x8ki-letl-twmt.n7.xano.io/api:1uUbbKJp/pharmacy-documents/40000000-0000-0000-0000-000000000001/approve' \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <admin_token>' \
  -d '{}'

## Job: expire-requests
curl -sS -X POST 'https://x8ki-letl-twmt.n7.xano.io/api:1uUbbKJp/jobs/expire-requests' \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <admin_token>' \
  -d '{}'

## Verify schema
curl -sS 'http://localhost:5432/' || true

## Xano direct SQL invitation
Xano Console > Database > Query:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
