# API Contracts — PharmaConnect v2.0

Source: docs/eng-review.md + pharmacy-connect references.

## Base

- Host: Xano backend URL
- Auth: Bearer <access_token>
- Error envelope: `{ error: { code, message, field_errors? } }`
- Idempotency key header on reservation/payment mutations: `Idempotency-Key`

## Patients

### Create anonymous request
POST /requests
Body: { product_type, notes, quantity?, images[]? }
Response: { request_id, expires_at }
Auth: none
Next: user prompted to create account / verify OTP

### Link existing request after signup
POST /requests/:id/link
Body: { account_token or access_token }
Response: { request_id }
Attaches pending request to authenticated user.

### Get request
GET /requests/:id
Response:
{
  id,
  product_type,
  status,
  expires_at,
  images: [{ url }],
  pharmacies: [
    { pharmacy_id, status, distance_km?: number, response?: {...} }
  ]
}

### Reserve response
POST /reservations
Headers: Idempotency-Key
Body: { request_id, response_id }
Response: { reservation_id, state, hold_expires_at }
Errors:
- 422 if illegal state transition
- 409 if hold expired or already reserved

## Pharmacies

### Receive nearby requests
GET /pharmacies/:id/requests?near=true&limit=20
Sorted by distance. Includes patient-request summary.

### Submit response
POST /responses
Body: { request_id, unit_price, quantity }
Response: { response_id, unit_price, tva_rate, tva_amount, total }

### Waiting list
GET /pharmacies/:id/waiting-list?state=ready
Response:
[
  {
    waiting_list_id,
    queue_position,
    ready_at,
    expires_at,
    reservation: { reservation_id, patient_name }
  }
]

### Mark ready / served
POST /reservations/:id/mark-ready
POST /reservations/:id/mark-served
Response: { reservation_id, state, updated_at }

## Admin

### Document review
POST /pharmacy-documents/:id/approve
POST /pharmacy-documents/:id/reject
Body: { review_note? }
Response: { pharmacy_id, approval_status? }

## Auth

### Request OTP
POST /auth/otp/request
Body: { phone }
Response: { masked_phone, cooldown_seconds }

### Verify OTP
POST /auth/otp/verify
Body: { phone, code, purpose }
Response: { access_token, refresh_token, user_id }

### Refresh token
POST /auth/refresh
Body: { refresh_token }
Response: { access_token, refresh_token }

### OAuth link
POST /auth/link
Body: { provider, provider_token }
Response: { access_token }

## Webhooks

### Payment webhook
POST /webhooks/payments/:provider
Body: { provider_transaction_id, status, amount?, raw? }
Behavior: idempotent, matches/recreates payment_transaction by provider_transaction_id

## Scheduled Jobs

Exposed as internal endpoints only if needed for manual backfill:
- POST /jobs/expire-requests
- POST /jobs/expire-reservations
- POST /jobs/expire-waiting-lists
- POST /jobs/renew-subscriptions
- POST /jobs/prune-push-tokens
