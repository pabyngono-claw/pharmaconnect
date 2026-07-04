# Xano Import Manifest — PharmaConnect v2.0

Use this manifest when creating tables in Xano. Order matters for FK dependencies.

## Phase 1: Auth/Identity

### users
Fields: id uuid pk, phone text unique, email text unique partial, password_hash text nullable, role enum patient/pharmacy/admin/super_admin, is_verified boolean default false, metadata jsonb, created_at timestamp, updated_at timestamp.

### otp_verifications
Fields: id uuid pk, user_id uuid nullable, phone text, code_hash text, purpose enum login/reset/link, attempts integer default 0, locked_until timestamp nullable, expires_at timestamp, consumed_at timestamp nullable, created_at timestamp.

### refresh_tokens
Fields: id uuid pk, user_id uuid, token_hash text, expires_at timestamp, rotated_at timestamp, revoked_at timestamp nullable, created_at timestamp.

### push_tokens
Fields: id uuid pk, user_id uuid, token text, platform enum ios/android/web, is_active boolean default true, last_used_at timestamp nullable, pruned_at timestamp nullable, created_at timestamp.

Indexes: users(phone), users(email)

## Phase 2: Pharmacy/Org

### organizations
Fields: id uuid pk, name text, registration_number text unique, created_at timestamp.

### pharmacies
Fields: id uuid pk, organization_id uuid nullable, name text, address text, quartier text, lat decimal, lng decimal, phone text unique, approval_status enum pending/approved/rejected/suspended, is_active boolean default false, created_at timestamp, updated_at timestamp.

### pharmacy_staff
Fields: id uuid pk, pharmacy_id uuid, user_id uuid, role enum owner/manager/staff, is_active boolean default true, created_at timestamp.

### pharmacy_documents
Fields: id uuid pk, pharmacy_id uuid, document_type enum business_registration/pharmacy_license/pharmacist_diploma/owner_id, file_url text, status enum pending/approved/rejected, review_note text nullable, reviewed_by uuid nullable, reviewed_at timestamp nullable, created_at timestamp.

### pharmacy_hours
Fields: id uuid pk, pharmacy_id uuid, day_of_week integer 0-6, open_time time, close_time time.

### garde_dates
Fields: id uuid pk, pharmacy_id uuid, staff_user_id uuid, start_at timestamp, end_at timestamp, overlap_token text nullable, created_at timestamp.

## Phase 3: Patients/Requests

### requests
Fields: id uuid pk, patient_id uuid, prescription_images_count integer default 0, product_type enum prescription/product/equipment, notes text nullable, quantity integer nullable, expires_at timestamp, status enum submitted/expired/reserved/served/cancelled, created_at timestamp, updated_at timestamp.

### request_images
Fields: id uuid pk, request_id uuid, url text, sort integer default 0, created_at timestamp.

### request_pharmacies
Fields: id uuid pk, request_id uuid, pharmacy_id uuid, status enum sent/viewed/responded, sent_at timestamp, viewed_at timestamp nullable, responded_at timestamp nullable, created_at timestamp.

### responses
Fields: id uuid pk, request_id uuid, pharmacy_id uuid, unit_price decimal(10,2), quantity integer, tva_rate decimal(5,2), tva_amount decimal(10,2), total decimal(10,2), status enum available/reserved/rejected/expired, hold_expires_at timestamp nullable, created_at timestamp.

## Phase 4: Reservations/Waiting

### reservations
Fields: id uuid pk, request_id uuid, response_id uuid, pharmacy_id uuid, patient_id uuid, state enum submitted/ready/served/rejected/expired/cancelled, hold_expires_at timestamp nullable, served_at timestamp nullable, created_at timestamp, updated_at timestamp.

### waiting_lists
Fields: id uuid pk, pharmacy_id uuid, reservation_id uuid nullable, queue_position integer, state enum ready/expired/served/cancelled, ready_at timestamp, expires_at timestamp, notified_at timestamp nullable, created_at timestamp.

## Phase 5: Operations

### notifications
Fields: id uuid pk, user_id uuid nullable, type enum request/response/reservation/waiting/payment/subscription, title text, body text, deep_link text, read_at timestamp nullable, created_at timestamp.

### audit_logs
Fields: id uuid pk, actor_user_id uuid nullable, action text, entity_type text, entity_id text, changes jsonb nullable, ip_address text nullable, user_agent text nullable, created_at timestamp.

### support_tickets
Fields: id uuid pk, user_id uuid, tier enum tier1/tier2/tier3, subject text, body text, status enum open/in_progress/resolved/closed, assigned_to uuid nullable, resolved_at timestamp nullable, created_at timestamp.

### subscriptions
Fields: id uuid pk, user_id uuid nullable, pharmacy_id uuid nullable, plan_id uuid, status enum trial/active/past_due/expired/cancelled, trial_ends_at timestamp nullable, current_period_start timestamp nullable, current_period_end timestamp nullable, cancel_at_period_end boolean default false, created_at timestamp.

### payment_transactions
Fields: id uuid pk, subscription_id uuid nullable, user_id uuid nullable, amount decimal(10,2), currency text default XOF, provider text, provider_transaction_id text unique, status enum pending/authorized/succeeded/failed/refunded, raw_payload jsonb nullable, created_at timestamp.

## Recommended Indexes
- users(phone)
- users(email)
- pharmacies(lat, lng) composite
- responses(request_id, status)
- reservations(state, hold_expires_at)
- waiting_lists(pharmacy_id, state, ready_at)
- payment_transactions(provider_transaction_id)
- notifications(user_id, read_at)
- request_pharmacies(request_id, pharmacy_id)

## Xano Implementation Notes
- Use Postgres database in Xano.
- Set enums as native PostgreSQL enums.
- Add updated_at trigger on: users, pharmacies, reservations.
- Restrict soft delete behavior to users and pharmacies only; keep operational rows for audit.
- encryption_at_rest is Xano-managed for file storage; enforce signed URLs for downloads.
- Row-level security not required if all access flows through Xano API auth middleware.
