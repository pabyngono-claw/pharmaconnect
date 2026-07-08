# Xano API Groups & Functions — PharmaConnect v2.0

Use this to build API Groups and internal functions in Xano.
Each section is copy-pasteable into Xano API Group + Function builders.

---

## Global Rules

- Auth:
  - `none` : Public
  - `access` : Bearer access token middleware
  - `refresh` : Refresh token middleware
  - `pharmacy` : access + pharmacy staff scope enforcement
  - `admin` : access + admin role enforcement
  - `provider secret` : webhook signature / shared secret header
- Error envelope on all errors:
  - `{ error: { code: string, message: string, field_errors?: array } }`
- CORS allowed origins:
  - Cloudflare Worker domain
  - FlutterFlow web domain
- Token TTL:
  - access token: 15 minutes
  - refresh token: 30 days + rotation

---

## API Group: auth

Routes:
- POST /auth/otp/request -> function: auth.request-otp
- POST /auth/otp/verify -> function: auth.verify-otp
- POST /auth/refresh -> function: auth.refresh
- POST /auth/link -> function: auth.link

### Function: auth.request-otp
Input schema:
- phone: string

Output schema:
- masked_phone: string
- cooldown_seconds: integer

Logic:
1. Normalize phone to E.164.
2. Count otp_verifications where phone = input.phone and created_at > now - 10m.
3. If >= 3 return 429 with cooldown_seconds = 600.
4. Generate 6-digit code as plaintext.
5. Store code_hash = bcrypt(code), expires_at = now + 5 minutes, attempts = 0, purpose = 'login'.
6. Send code via configured SMS/WhatsApp provider.
7. Return masked_phone and cooldown_seconds = 0.

### Function: auth.verify-otp
Input schema:
- phone: string
- code: string
- purpose: enum login|reset|link

Output schema:
- access_token: string
- refresh_token: string
- user_id: string

Logic:
1. Fetch latest otp_verification for phone + purpose where consumed_at is null and locked_until is null and expires_at > now.
2. If missing => 401.
3. If attempts >= 5 => 401.
4. If bcrypt compare fails => attempts += 1; if attempts >= 5 set locked_until = now + 10m; return 401.
5. Success => set consumed_at = now.
6. Find or create user by phone; if created set role = 'patient', is_verified = true.
7. Create refresh_tokens entry with token_hash, expires_at = now + 30 days.
8. Issue access token according to access token TTL.
9. Return tokens and user_id.

### Function: auth.refresh
Input schema:
- refresh_token: string

Output schema:
- access_token: string
- refresh_token: string

Logic:
1. Find refresh_tokens row matching token_hash where revoked_at is null and expires_at > now.
2. If missing => 401.
3. Set previous revoked_at = now.
4. Create new refresh_tokens row with new token_hash, expires_at = now + 30 days, rotated_at = now.
5. Return new access and refresh tokens.

### Function: auth.link
Input schema:
- provider: string
- provider_token: string

Output schema:
- access_token: string

Logic:
1. Verify provider identity using provider_token (mock or actual Google OAuth verification).
2. Find or create user account based on provider subject / email.
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
- create, list: access optional; if authenticated, attach patient_id automatically if not provided
- get: access
- link: access
- reservations.create: access + idempotency header check

Common helpers:
- request.pharmacies fan-out: query pharmacies ordered by distance using lat/lng, default nearest N = 20 within radius = 10 km.

### Function: requests.create
Input schema:
- product_type: enum prescription|product|equipment
- notes: string?
- quantity: integer?
- images: array of { url: string }?
- metadata: jsonb?

Output schema:
- request_id: string
- expires_at: timestamp

Logic:
1. Validate input.
2. If authenticated, patient_id = access_token user_id; else mark guest flag.
3. expires_at = now() + 72 hours.
4. Insert request.
5. Insert request_images if any, ordered by sort.
6. Insert request_pharmacies for nearest pharmacies.
7. Create system notification for patient.
8. Return request_id and expires_at.

### Function: requests.link
Input schema:
- request_id: string
- account_token or access_token: string

Output schema:
- request_id: string

Logic:
1. Find request by id with no patient_id and not expired.
2. If missing => 404.
3. Resolve user_id from access_token.
4. Update request.patient_id = user_id.
5. Return request_id.

### Function: requests.get
Input schema:
- id: string path param

Output schema:
- id, product_type, status, expires_at, notes, quantity
- images: [{ url, sort }]
- pharmacies: [{ pharmacy_id, status, distance_km?, response? }]

Logic:
1. Resolve authenticated patient_id from access token.
2. Fetch request by id.
3. If not found or auth user mismatch without admin/staff scope => 404 or 403.
4. Fetch request_images sorted by sort.
5. Fetch request_pharmacies with pharmacy basic info.
6. Fetch response for pharmacies where status = 'responded'.
7. Compute distance_km if lat/lng available and requester location known.
8. Return payload.

### Function: requests.list
Input schema:
- page: integer?
- limit: integer?
- status: enum?

Output schema:
- items: array of request summary
- page, limit, total

Logic:
1. Resolve patient_id by access token.
2. Filter requests by patient_id, optional status, order by created_at desc.
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
- All these require `pharmacy` scope or admin. For staff, ensure pharmacy_id mapping matches.

### Function: pharmacies.nearby-requests
Input schema:
- id: string path param
- near: boolean?
- limit: integer?
- status?: enum sent|viewed|responded

Output schema:
- requests: array of request summaries sorted by distance

Logic:
1. Verify pharmacy scope by pharmacy_staff mapping or pharmacy_id.
2. Fetch pharmacy location.
3. Fetch request_pharmacies joined to requests where nearest pharmacies, order by distance using Haversine or supplied distance_km.
4. Filter by status if provided.
5. Return summaries with minimal patient info.

### Function: responses.create
Input schema:
- request_id: string
- unit_price: decimal
- quantity: integer

Output schema:
- response_id: string
- unit_price, tva_rate, tva_amount, total

Logic:
1. Verify pharmacy staff for request.pharmacy mapping through request_pharmacies.
2. Fetch request; ensure expires_at > now.
3. Default tva_rate from pharmacy config or 18%.
4. tva_amount = unit_price * quantity * tva_rate / 100.
5. total = unit_price * quantity + tva_amount.
6. Insert response with status = 'available'.
7. Update request_pharmacies status = 'responded'.
8. Create notification for patient and pharmacy.
9. Return response fields.

### Function: pharmacies.waiting-list
Input schema:
- id: string path param
- state?: enum ready|expired|served|cancelled

Output schema:
- items: array of waiting list entries with reservation snapshot

Logic:
1. Verify pharmacy scope.
2. Fetch waiting_lists for pharmacy_id, filter state if provided, order by queue_position or ready_at.
3. Join reservation basic fields if present.
4. Return items.

### Function: pharmacies.mark-ready
Input schema:
- id: string path param, reservation_id

Output schema:
- reservation_id: string
- state: string
- updated_at: timestamp

Logic:
1. Verify pharmacy owns reservation.
2. If state != 'submitted' => 422.
3. Update reservation.state = 'ready', hold_expires_at = now + 24 hours.
4. Insert waiting_lists entry with queue_position = max queue_position + 1, state = 'ready', ready_at = now, expires_at = now + 24 hours.
5. Create notification for patient.
6. Return updated reservation.

### Function: pharmacies.mark-served
Input schema:
- id: string path param, reservation_id

Output schema:
- reservation_id: string
- state: string
- updated_at: timestamp

Logic:
1. Verify pharmacy owns reservation.
2. If state != 'ready' => 422.
3. Update reservation.state = 'served', served_at = now.
4. Update waiting_lists entry state = 'served'.
5. Create notification for patient.
6. Return updated reservation.

---

## API Group: admin

Routes:
- POST /pharmacy-documents/:id/approve -> function: admin.approve-document
- POST /pharmacy-documents/:id/reject -> function: admin.reject-document
- GET /admin/pharmacies -> function: admin.list-pharmacies
- GET /admin/requests -> function: admin.list-requests

Middleware:
- admin only

### Function: admin.approve-document
Input schema:
- id: string path param, document_id
- review_note?: string

Output schema:
- pharmacy_id: string
- approval_status?: string

Logic:
1. Ensure requester is admin.
2. Update pharmacy_documents set status = 'approved', reviewed_by = admin user, reviewed_at = now, review_note.
3. Recompute pharmacy approval_status: if all 4 documents approved -> approved, else remain pending.
4. Create notification for pharmacy owner.
5. Return pharmacy_id and approval_status if changed.

### Function: admin.reject-document
Input schema:
- id: string path param, document_id
- review_note?: string

Output schema:
- pharmacy_id: string
- approval_status?: string

Logic:
1. Ensure requester is admin.
2. Update pharmacy_documents set status = 'rejected', reviewed_by = admin user, reviewed_at = now, review_note.
3. Recompute pharmacy approval_status -> pending if previously approved and now incomplete.
4. Create notification for pharmacy owner.
5. Return pharmacy_id and approval_status.

### Function: admin.list-pharmacies
Input schema:
- page, limit, approval_status?

Output schema:
- items: array
- page, limit, total

Logic:
1. Ensure requester is admin.
2. Filter pharmacies by approval_status if provided.
3. Paginate and return.

### Function: admin.list-requests
Input schema:
- page, limit, status?

Output schema:
- items: array
- page, limit, total

Logic:
1. Ensure requester is admin.
2. Filter requests by status if provided.
3. Paginate and return.

---

## API Group: webhooks

Routes:
- POST /webhooks/payments/:provider -> function: webhooks.payments

Middleware:
- provider secret verification

### Function: webhooks.payments
Input schema:
- provider_transaction_id: string
- status: string
- amount?: decimal
- currency?: string, default XOF
- raw?: jsonb
- subscription_id?: string

Output schema:
- transaction_id: string
- status: string

Validation:
- Reject 400 if provider_transaction_id missing or provider unknown
- Reject 401 or 403 if provider signature check fails
- Reject 400 if status mapping fails

Business logic:
1. Map status: succeeded|success -> succeeded; failed|fail -> failed; refunded|refund -> refunded; authorized|pending -> authorized; else pending.
2. Upsert into payment_transactions using provider_transaction_id unique key.
   - On insert: populate amount, currency default 'XOF', raw_payload.
   - On update: do not downgrade terminal statuses succeeded/refunded/failed unless explicit reconciliation event; append previous status to audit_logs.
3. subscription_id handling:
   - If provided in payload or derivable: link to payment_transaction.subscription_id.
   - On status = succeeded: activate or extend subscription per plan mapping.
4. Return the transaction_id and normalized status.
5. Always append audit_log entry with actor_user_id = provider Webhook system user if exists; else system.

---

## API Group: jobs

Routes:
- POST /jobs/expire-requests -> internal or protected by API key
- POST /jobs/expire-reservations
- POST /jobs/expire-waiting-lists
- POST /jobs/renew-subscriptions
- POST /jobs/prune-push-tokens

Authentication:
- internal only or shared admin API key header
- Do not expose publicly
- Prefer Xano Scheduled Tasks; keep endpoints for manual backfill only

Job implementations should wrap work in try/catch, append audit_logs with action = 'scheduler:<job>' and success = true/false, and alert admin if failures >= 3 consecutive runs.
