# Xano Backend Setup — PharmaConnect v2.0

This package is the single source of truth for creating the backend in Xano. Complete these steps in order.

## Prerequisites
- Xano workspace created
- Xano API token generated
- Workspace URL recorded

## Step 1: Create Database and Tables

### 1.1 Create Postgres Database
- In your workspace, go to **Database**
- Create a new database called `pharmaconnect`
- Enable native enums in database settings if available

### 1.2 Create Enums First

Create the following enums under **Database > Enums**:

```sql
-- Auth
role_enum: patient, pharmacy, admin, super_admin
purpose_enum: login, reset, link
platform_enum: ios, android, web

-- Pharmacy
approval_status_enum: pending, approved, rejected, suspended
document_type_enum: business_registration, pharmacy_license, pharmacist_diploma, owner_id
role_staff_enum: owner, manager, staff
document_status_enum: pending, approved, rejected

-- Requests
product_type_enum: prescription, product, equipment
request_status_enum: submitted, expired, reserved, served, cancelled
request_pharmacy_status_enum: sent, viewed, responded

-- Responses
response_status_enum: available, reserved, rejected, expired

-- Reservations
reservation_state_enum: submitted, ready, served, rejected, expired, cancelled
waiting_state_enum: ready, expired, served, cancelled

-- Notifications
notification_type_enum: request, response, reservation, waiting, payment, subscription

-- Support
ticket_tier_enum: tier1, tier2, tier3
ticket_status_enum: open, in_progress, resolved, closed

-- Subscriptions
subscription_status_enum: trial, active, past_due, expired, cancelled

-- Payments
payment_status_enum: pending, authorized, succeeded, failed, refunded
currency_default: XOF
provider_enum: orange_money, wave, stripe
```

### 1.3 Create Tables

Create the 21 tables in this exact order due to foreign key dependencies.

<table-1>
Name: users
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- phone: text, unique, required
- email: text, unique, nullable
- password_hash: text, nullable
- role: role_enum, default: patient
- is_verified: boolean, default: false
- metadata: jsonb, default: {}
- created_at: timestamp, default: now()
- updated_at: timestamp, default: now()

Indexes:
- users_phone_idx on (phone)
- users_email_idx on (email)
</table-1>

<table-2>
Name: otp_verifications
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- user_id: uuid, nullable, foreign key to users(id)
- phone: text, required
- code_hash: text, required
- purpose: purpose_enum, required
- attempts: integer, default: 0
- locked_until: timestamp, nullable
- expires_at: timestamp, required
- consumed_at: timestamp, nullable
- created_at: timestamp, default: now()

Indexes:
- otp_phone_purpose_idx on (phone, purpose, created_at)
</table-2>

<table-3>
Name: refresh_tokens
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- user_id: uuid, required, foreign key to users(id)
- token_hash: text, required
- expires_at: timestamp, required
- rotated_at: timestamp, required
- revoked_at: timestamp, nullable
- created_at: timestamp, default: now()

Indexes:
- refresh_tokens_user_idx on (user_id, revoked_at)
</table-3>

<table-4>
Name: push_tokens
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- user_id: uuid, required, foreign key to users(id)
- token: text, required
- platform: platform_enum, required
- is_active: boolean, default: true
- last_used_at: timestamp, nullable
- pruned_at: timestamp, nullable
- created_at: timestamp, default: now()

Indexes:
- push_tokens_user_idx on (user_id, pruned_at)
</table-4>

<table-5>
Name: organizations
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- name: text, required
- registration_number: text, unique, required
- created_at: timestamp, default: now()

Indexes:
- organizations_registration_idx on (registration_number)
</table-5>

<table-6>
Name: pharmacies
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- organization_id: uuid, nullable, foreign key to organizations(id)
- name: text, required
- address: text, required
- quartier: text, required
- lat: decimal(10, 8), required
- lng: decimal(11, 8), required
- phone: text, unique, required
- approval_status: approval_status_enum, default: pending
- is_active: boolean, default: false
- created_at: timestamp, default: now()
- updated_at: timestamp, default: now()

Indexes:
- pharmacies_location_idx on (lat, lng)
- pharmacies_status_idx on (approval_status)
</table-6>

<table-7>
Name: pharmacy_staff
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- pharmacy_id: uuid, required, foreign key to pharmacies(id)
- user_id: uuid, required, foreign key to users(id)
- role: role_staff_enum, default: staff
- is_active: boolean, default: true
- created_at: timestamp, default: now()

Indexes:
- pharmacy_staff_pharmacy_user_idx on (pharmacy_id, user_id)
</table-7>

<table-8>
Name: pharmacy_documents
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- pharmacy_id: uuid, required, foreign key to pharmacies(id)
- document_type: document_type_enum, required
- file_url: text, required
- status: document_status_enum, default: pending
- review_note: text, nullable
- reviewed_by: uuid, nullable, foreign key to users(id)
- reviewed_at: timestamp, nullable
- created_at: timestamp, default: now()

Indexes:
- pharmacy_documents_pharmacy_idx on (pharmacy_id)
</table-8>

<table-9>
Name: pharmacy_hours
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- pharmacy_id: uuid, required, foreign key to pharmacies(id)
- day_of_week: integer, required
- open_time: time, required
- close_time: time, required

Indexes:
- pharmacy_hours_pharmacy_day_idx on (pharmacy_id, day_of_week)
</table-9>

<table-10>
Name: garde_dates
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- pharmacy_id: uuid, required, foreign key to pharmacies(id)
- staff_user_id: uuid, required, foreign key to users(id)
- start_at: timestamp, required
- end_at: timestamp, required
- overlap_token: text, nullable
- created_at: timestamp, default: now()

Indexes:
- garde_dates_pharmacy_idx on (pharmacy_id, start_at, end_at)
</table-10>

<table-11>
Name: requests
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- patient_id: uuid, required, foreign key to users(id)
- prescription_images_count: integer, default: 0
- product_type: product_type_enum, required
- notes: text, nullable
- quantity: integer, nullable
- expires_at: timestamp, required
- re_broadcast_suggested: boolean, default: false
- status: request_status_enum, default: submitted
- created_at: timestamp, default: now()
- updated_at: timestamp, default: now()

Indexes:
- requests_patient_idx on (patient_id, created_at)
- requests_expires_status_idx on (expires_at, status)
</table-11>

<table-12>
Name: request_images
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- request_id: uuid, required, foreign key to requests(id)
- url: text, required
- sort: integer, default: 0
- created_at: timestamp, default: now()

Indexes:
- request_images_request_idx on (request_id)
</table-12>

<table-13>
Name: request_pharmacies
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- request_id: uuid, required, foreign key to requests(id)
- pharmacy_id: uuid, required, foreign key to pharmacies(id)
- status: request_pharmacy_status_enum, default: sent
- sent_at: timestamp, default: now()
- viewed_at: timestamp, nullable
- responded_at: timestamp, nullable
- created_at: timestamp, default: now()

Indexes:
- request_pharmacies_request_pharmacy_idx on (request_id, pharmacy_id)
</table-13>

<table-14>
Name: responses
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- request_id: uuid, required, foreign key to requests(id)
- pharmacy_id: uuid, required, foreign key to pharmacies(id)
- unit_price: decimal(10, 2), required
- quantity: integer, required
- tva_rate: decimal(5, 2), required
- tva_amount: decimal(10, 2), required
- total: decimal(10, 2), required
- status: response_status_enum, default: available
- hold_expires_at: timestamp, nullable
- created_at: timestamp, default: now()

Indexes:
- responses_request_status_idx on (request_id, status)
</table-14>

<table-15>
Name: reservations
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- request_id: uuid, required, foreign key to requests(id)
- response_id: uuid, required, foreign key to responses(id)
- pharmacy_id: uuid, required, foreign key to pharmacies(id)
- patient_id: uuid, required, foreign key to users(id)
- state: reservation_state_enum, default: submitted
- hold_expires_at: timestamp, nullable
- served_at: timestamp, nullable
- created_at: timestamp, default: now()
- updated_at: timestamp, default: now()

Indexes:
- reservations_state_hold_idx on (state, hold_expires_at)
</table-15>

<table-16>
Name: waiting_lists
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- pharmacy_id: uuid, required, foreign key to pharmacies(id)
- reservation_id: uuid, nullable, foreign key to reservations(id)
- queue_position: integer, required
- state: waiting_state_enum, default: ready
- ready_at: timestamp, required
- expires_at: timestamp, required
- notified_at: timestamp, nullable
- created_at: timestamp, default: now()

Indexes:
- waiting_lists_pharmacy_state_ready_idx on (pharmacy_id, state, ready_at)
</table-16>

<table-17>
Name: notifications
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- user_id: uuid, nullable, foreign key to users(id)
- type: notification_type_enum, required
- title: text, required
- body: text, required
- deep_link: text, nullable
- read_at: timestamp, nullable
- created_at: timestamp, default: now()

Indexes:
- notifications_user_read_idx on (user_id, read_at)
</table-17>

<table-18>
Name: audit_logs
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- actor_user_id: uuid, nullable, foreign key to users(id)
- action: text, required
- entity_type: text, required
- entity_id: text, required
- changes: jsonb, nullable
- ip_address: text, nullable
- user_agent: text, nullable
- created_at: timestamp, default: now()

Indexes:
- audit_logs_entity_idx on (entity_type, entity_id, created_at)
</table-18>

<table-19>
Name: support_tickets
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- user_id: uuid, required, foreign key to users(id)
- tier: ticket_tier_enum, default: tier1
- subject: text, required
- body: text, required
- status: ticket_status_enum, default: open
- assigned_to: uuid, nullable, foreign key to users(id)
- resolved_at: timestamp, nullable
- created_at: timestamp, default: now()

Indexes:
- support_tickets_status_idx on (status, tier)
</table-19>

<table-20>
Name: subscriptions
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- user_id: uuid, nullable, foreign key to users(id)
- pharmacy_id: uuid, nullable, foreign key to pharmacies(id)
- plan_id: uuid, required
- status: subscription_status_enum, default: trial
- trial_ends_at: timestamp, nullable
- current_period_start: timestamp, nullable
- current_period_end: timestamp, nullable
- cancel_at_period_end: boolean, default: false
- created_at: timestamp, default: now()

Indexes:
- subscriptions_status_idx on (status, current_period_end)
</table-20>

<table-21>
Name: payment_transactions
Fields:
- id: uuid, primary key, default: uuid_generate_v4()
- subscription_id: uuid, nullable, foreign key to subscriptions(id)
- user_id: uuid, nullable, foreign key to users(id)
- amount: decimal(10, 2), required
- currency: text, default: XOF
- provider: provider_enum, required
- provider_transaction_id: text, unique, required
- status: payment_status_enum, default: pending
- raw_payload: jsonb, nullable
- created_at: timestamp, default: now()

Indexes:
- payment_transactions_provider_txn_idx on (provider_transaction_id)
</table-21>

## Step 2: Triggers and Functions

Add this trigger in Xano **Database > Functions / Triggers** or via SQL if supported:

```sql
-- Update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON pharmacies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 3: API Groups and Routes

Create these API groups in Xano **API** section, matching the routes in backend/xano/api-snapshot.md:
- auth
- requests
- reservations
- pharmacies
- admin
- webhooks
- jobs

Use the function stubs in backend/xano/function-stubs.md as implementation starting points.

## Step 4: Scheduled Tasks

Create scheduled jobs in Xano matching backend/xano/scheduled-tasks-guide.md:
- expire-requests every 15 minutes
- expire-reservations every 5 minutes
- expire-waiting-lists every 15 minutes
- renew-subscriptions daily at 09:00 UTC
- prune-push-tokens weekly Sunday 04:00 UTC

## Step 5: Security Rules

In Xano app settings:
- Enable custom auth
- Set access token TTL to 15 minutes
- Set refresh token TTL to 30 days
- Enable refresh token rotation
- Restrict pharmacy scope to pharmacy_staff mapping
- Add admin-only security rules on admin endpoints
- Set CORS allowed origins to your Cloudflare Worker domain and FlutterFlow web domain

## Verification List

After setup, verify:
- [ ] 21 tables visible in Database
- [ ] All enum values correct
- [ ] Indexes applied on all listed pairs
- [ ] updated_at triggers on users, pharmacies, requests, reservations
- [ ] API groups deployed and accessible
- [ ] Auth endpoints return tokens
- [ ] Health check endpoint responds 200
- [ ] Scheduled jobs listed with correct frequency

If any table fails to create, remove foreign key constraints temporarily, create child tables first, then add constraints.
