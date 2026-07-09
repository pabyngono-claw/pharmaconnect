# Xano API Groups & Functions — PharmaConnect v2.0

Use this when building API Groups in Xano console.
All table names match the actual Xano-native schema.

Global auth rules:
- Public: none
- Patient/User: access token (Bearer)
- Pharmacy staff: access token + pharmacy staff scope
- Admin: access token + admin role
- Webhook: provider secret header

Error envelope:
- `{ "error": { "code": "string", "message": "string", "field_errors": [] } }`

---

## API Group: auth

Routes:
- POST /auth/otp/request -> function: auth.request-otp
- POST /auth/otp/verify -> function: auth.verify-otp
- POST /auth/refresh -> function: auth.refresh
- POST /auth/link -> function: auth.link

### Function: auth.request-otp
Input:
- phone: string

Output:
- masked_phone: string
- cooldown_seconds: integer

Logic:
1. Normalize phone to E.164.
2. Count otp_verifications where phone = input.phone and created_at > now - 10m.
3. If >= 3 return 429 with cooldown_seconds = 600.
4. Generate 6-digit code.
5. Store code_hash = bcrypt(code), expires_at = now + 5 minutes, attempts = 0, purpose = 'login'.
6. Send code via SMS/WhatsApp provider.
7. Return masked_phone and cooldown_seconds = 0.

### Function: auth.verify-otp
Input:
- phone: string
- code: string
- purpose: string (login|reset|link)

Output:
- access_token: string
- refresh_token: string
- user_id: string

Logic:
1. Fetch latest otp_verifications row for phone + purpose where consumed_at is null, locked_until is null, expires_at > now.
2. If missing => 401.
3. If attempts >= 5 => 401.
4. If bcrypt compare fails => attempts += 1; if attempts >= 5 set locked_until = now + 10m; return 401.
5. Success => set consumed_at = now.
6. Find or create users row by phone; if created set role = 'patient', is_verified = true.
7. Create refresh_tokens entry with token_hash, expires_at = now + 30 days.
8. Issue access token (15 min TTL).
9. Return tokens and user_id.

### Function: auth.refresh
Input:
- refresh_token: string

Output:
- access_token: string
- refresh_token: string

Logic:
1. Find refresh_tokens row matching token_hash where revoked_at is null and expires_at > now.
2. If missing => 401.
3. Set previous revoked_at = now.
4. Create new refresh_tokens row with new token_hash, expires_at = now + 30 days, rotated_at = now.
5. Return new tokens.

### Function: auth.link
Input:
- provider: string
- provider_token: string

Output:
- access_token: string

Logic:
1. Verify provider identity using provider_token.
2. Find or create users account based on provider subject / email.
3. Return access_token.

---

## API Group: requests

Routes:
- POST /requests -> function: requests.create
- POST /requests/:id/link -> function: requests.link
- GET /requests/:id -> function: requests.get
- GET /requests -> function: requests.list
- POST /reservations -> function: reservations.create

Middleware:
- create, list: access optional; if authenticated, attach patient_id automatically
- get: access
- link: access
- reservations.create: access + idempotency header check

### Function: requests.create
Input:
- product_type: string (prescription|product|equipment)
- notes: string?
- quantity: integer?
- images: array of { url: string }?
- metadata: jsonb?

Output:
- request_id: string
- expires_at: timestamp

Logic:
1. Validate input.
2. If authenticated, patient_id = access_token user_id.
3. expires_at = now() + 72 hours.
4. Insert medicine_request.
5. Insert request_items if any, ordered by sort.
6. Insert request_pharmacies for nearest pharmacies (geo-search).
7. Create notification for patient.
8. Return request_id and expires_at.

### Function: requests.link
Input:
- request_id: string
- access_token: string

Output:
- request_id: string

Logic:
1. Find medicine_request by id with patient_id null and not expired.
2. If missing => 404.
3. Resolve user_id from access_token.
4. Update medicine_request.patient_id = user_id.
5. Return request_id.

### Function: requests.get
Input:
- id: string path param

Output:
- id, product_type, status, expires_at, notes, quantity
- images: [{ url, sort }]
- pharmacies: [{ pharmacy_id, status, distance_km?, response? }]

Logic:
1. Resolve patient_id from access token.
2. Fetch medicine_request by id.
3. If mismatch without admin/staff => 403.
4. Fetch request_items sorted by sort.
5. Fetch request_pharmacies with pharmacy info.
6. Fetch pharmacy_response for pharmacies where status = 'responded'.
7. Compute distance if location known.
8. Return payload.

### Function: requests.list
Input:
- page: integer?
- limit: integer?
- status: string?

Output:
- items: array
- page, limit, total

Logic:
1. Resolve patient_id by access token.
2. Filter by patient_id, optional status, order by created_at desc.
3. Paginate.
4. Return items and totals.

---

## API Group: pharmacies

Routes:
- GET /pharmacies/:id/requests -> function: pharmacies.nearby-requests
- POST /responses -> function: responses.create
- GET /pharmacies/:id/waiting-list -> function: pharmacies.waiting-list
- POST /reservations/:id/mark-ready -> function: pharmacies.mark-ready
- POST /reservations/:id/mark-served -> function: pharmacies.mark-served

Middleware:
- All require pharmacy scope or admin.

### Function: pharmacies.nearby-requests
Input:
- id: pharmacy_id path param
- near: boolean?
- limit: integer?
- status?: string

Output:
- requests: array sorted by distance

Logic:
1. Verify pharmacy scope.
2. Query request_pharmacies joined with medicine_request for this pharmacy.
3. Filter by optional status.
4. Order by distance if lat/lng available.
5. Return.

### Function: responses.create
Input:
- request_id: string
- pharmacy_id: string
- unit_price: number
- quantity: integer
- tva_rate: number

Output:
- response_id: string

Logic:
1. Verify pharmacy scope.
2. Validate request not expired.
3. Compute tva_amount = unit_price * quantity * tva_rate / 100.
4. Compute total = unit_price * quantity + tva_amount.
5. Insert pharmacy_response.
6. Update request_pharmacies status = 'responded', responded_at = now.
7. Create notification for patient.
8. Return response_id.

### Function: pharmacies.waiting-list
Input:
- id: pharmacy_id path param

Output:
- queue: array of waiting list items ordered by queue_position

Logic:
1. Verify pharmacy scope.
2. Fetch waitlist rows for pharmacy with state = 'ready', ordered by queue_position.
3. Return.

### Function: pharmacies.mark-ready
Input:
- id: reservation_id path param

Output:
- reservation_id: string

Logic:
1. Verify pharmacy scope.
2. Find reservation by id.
3. Update state = 'ready', hold_expires_at = now + 2 hours.
4. Create notification for patient.
5. Return reservation_id.

### Function: pharmacies.mark-served
Input:
- id: reservation_id path param

Output:
- reservation_id: string

Logic:
1. Verify pharmacy scope.
2. Find reservation by id.
3. Update state = 'served', served_at = now.
4. Expire related waiting list entry if exists.
5. Create notification for patient.
6. Return reservation_id.

---

## API Group: reservations

Routes:
- POST /reservations -> function: reservations.create
- POST /reservations/:id/cancel -> function: reservations.cancel

Middleware:
- reservations.create: access + idempotency header
- cancel: access

### Function: reservations.create
Input:
- request_id: string
- response_id: string
- pharmacy_id: string
- idempotency_key: string header

Output:
- reservation_id: string

Logic:
1. Check idempotency_key not used.
2. Verify medicine_request not expired.
3. Verify pharmacy_response status = 'available'.
4. Insert reservation with state = 'submitted'.
5. Expire other available responses for same request.
6. Update pharmacy_response status = 'reserved'.
7. Create notification for patient and pharmacy.
8. Return reservation_id.

### Function: reservations.cancel
Input:
- id: reservation_id path param

Output:
- reservation_id: string

Logic:
1. Resolve patient_id from access token.
2. Find reservation by id where patient_id matches.
3. Update state = 'cancelled'.
4. Optionally free related pharmacy_response.
5. Return reservation_id.

---

## API Group: admin

Routes:
- POST /pharmacy-documents/:id/approve -> function: admin.approve-document
- GET /audit-logs -> function: admin.audit-logs
- GET /subscriptions -> function: admin.subscriptions
- PUT /subscriptions/:id -> function: admin.subscriptions-update

Middleware:
- All require admin role.

### Function: admin.approve-document
Input:
- id: document_id path param
- action: string (approve|reject)
- review_note: string?

Output:
- document_id: string

Logic:
1. Verify admin role.
2. Find pharmacy_documents by id.
3. Update status = approved or rejected, reviewed_by = admin user_id, reviewed_at = now.
4. If all documents for pharmacy approved, update pharmacy approval_status = 'approved', is_active = true.
5. Create notification for pharmacy staff.
6. Return document_id.

### Function: admin.audit-logs
Input:
- page: integer?
- limit: integer?
- entity_type?: string

Output:
- items: array
- page, limit, total

Logic:
1. Verify admin role.
2. Query audit_logs ordered by created_at desc.
3. Filter by optional entity_type.
4. Paginate.
5. Return.

### Function: admin.subscriptions
Input:
- page: integer?
- limit: integer?
- status?: string

Output:
- items: array
- page, limit, total

Logic:
1. Verify admin role.
2. Query subscriptions with optional status filter.
3. Paginate.
4. Return.

### Function: admin.subscriptions-update
Input:
- id: subscription_id path param
- status: string
- current_period_end?: datetime

Output:
- subscription_id: string

Logic:
1. Verify admin role.
2. Update subscription fields.
3. Insert audit_log with changes.
4. Create notification for user/pharmacy.
5. Return subscription_id.

---

## API Group: webhooks

Routes:
- POST /webhooks/payments/orange_money -> function: webhooks.payments
- POST /webhooks/payments/wave -> function: webhooks.payments

Middleware:
- Verify provider signature header.

### Function: webhooks.payments
Input:
- provider: string (from route)
- signature: string header
- payload: json body

Output:
- received: boolean

Logic:
1. Verify signature using provider secret.
2. Find or create payment row by provider_transaction_id.
3. Parse status from payload.
4. Update payment status accordingly.
5. Update subscription status if applicable.
6. Create notification for user.
7. Insert audit_log.
8. Return received: true.

---

## API Group: jobs

Routes:
- POST /jobs/expire-requests -> function: jobs.expire-requests
- POST /jobs/expire-reservations -> function: jobs.expire-reservations
- POST /jobs/expire-waiting-lists -> function: jobs.expire-waiting-lists
- POST /jobs/renew-subscriptions -> function: jobs.renew-subscriptions
- POST /jobs/prune-push-tokens -> function: jobs.prune-push-tokens

Middleware:
- Internal or admin API key.

### Function: jobs.expire-requests
Logic:
1. Update medicine_request set status = 'expired' where status = 'submitted' and expires_at <= now.
2. Set re_broadcast_suggested = true if no reservation exists.
3. Insert notification for patient.
4. Insert audit_log.

### Function: jobs.expire-reservations
Logic:
1. Update reservation set state = 'expired' where state in ('submitted', 'ready') and hold_expires_at <= now.
2. Update related waitlist rows to 'expired'.
3. Insert notifications.
4. Insert audit_log.

### Function: jobs.expire-waiting-lists
Logic:
1. Update waitlist set state = 'expired' where state = 'ready' and expires_at <= now.
2. Promote next ready row if any by renumbering queue_position.
3. Insert notifications.
4. Insert audit_log.

### Function: jobs.renew-subscriptions
Logic:
1. Update subscription set status = 'past_due' where status = 'trial' and trial_ends_at <= now.
2. Update subscription set status = 'expired' where status = 'active' and current_period_end <= now.
3. Insert notifications and audit_logs.

### Function: jobs.prune-push-tokens
Logic:
1. Update push_tokens set is_active = false, pruned_at = now where is_active = true and last_used_at <= now - interval 60 days.
2. Insert audit_log.
