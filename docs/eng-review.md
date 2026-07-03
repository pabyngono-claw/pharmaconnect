# Eng Manager Review — PharmaConnect v2.0

Status: Locked
Date: 2026-07-03

## Architecture Lock

Three-layer architecture:

```
Cloudflare Workers -> FlutterFlow Web/Mobile
        |
    Xano Backend
        |
  API Consumers / Integrations
```

Frontend rendered as static assets on Cloudflare Workers. Xano handles API, database, scheduled tasks, storage, and auth. FlutterFlow builds the client.

## Data Layer Schema

Canonical 21-table schema in Xano:

Auth/Identity:
- users, otp_verifications, refresh_tokens, push_tokens

Pharmacy/Org:
- organizations, pharmacies, pharmacy_staff, pharmacy_documents, pharmacy_hours, garde_dates

Patients/Requests:
- requests, request_images, request_pharmacies, responses

Reservations/Waiting:
- reservations, waiting_lists

Operations:
- notifications, audit_logs, support_tickets, subscriptions, payment_transactions

### Schema Constraints

- users.phone must be unique globally
- responses.unit_price is decimal(10,2), quantity integer
- reservations.state is an enum with strict server-side transitions
- payment_transactions.provider_transaction_id is unique
- All TVA math in Xano Compute, never in FlutterFlow

## API Layer Contract

- POST /requests: fan-out to N nearest pharmacies in < 800ms
- Geo-search: Haversine computed server-side, pre-sorted
- Reservation mutations: require Idempotency-Key header
- Error envelope: `{ error: { code, message, field_errors? } }`
- Auth: 15-min access token + 30-day rotating refresh token
- OTP: hashed at rest, 5 attempts then lockout, 3 per phone per 10 min

## Frontend Contract

- Auth-first paths: /login, /verify-otp, /link-oauth
- Patient paths: /requests/new, /requests/:id, /reservations, /collection
- Pharmacy paths: /dashboard, /requests/:id/respond, /waiting-list
- Admin paths: /admin/pharmacies, /admin/pharmacies/:id/documents
- Offline behavior: cached reads, explicit disabled state on writes
- No Firebase Auth; backend auth only

## State Machines

Reservations server-side enforced:
- SUBMITTED -> ready, rejected, expired, cancelled
- READY -> served, rejected
- Illegal transition returns 422

Request lifecycle:
- submitted -> viewed -> responded -> reserved -> served
- expires_at without reservation -> auto-expire + re-broadcast suggestion

## Scheduled Tasks

1. Request expiry sweep every 15 min
2. Reservation hold sweep every 5 min
3. Waiting list window sweep every 15 min
4. Subscription renewal check daily
5. Push token pruning weekly

## Integrations

- FCM: request permission post-login, send token after registration
- Google Maps: place autocomplete, haversine sort
- Orange Money / Wave: webhook handlers with idempotency
- Stripe: subscriptions, trials, past_due/expired
- Xano file storage: prescription images + pharmacy docs
- Lambda: EXIF stripping, JPEG re-encode to <= 1600px / 80q

## Release Gate

Before `/ship`:
- `/review` diff review passes
- `/qa` TC-01..TC-12 pass
- `/cso` security audit passes
- Lighthouse >= 90 on mobile/desktop
- `.github/workflows/deploy.yml` configured for Cloudflare Workers

## Critical Non-Negotiables

- TVA server-side only
- OTP hashed only, never logged
- Reservation mutations require Idempotency-Key
- Payment transactions require unique provider_transaction_id
- Soft delete + anonymize for right to erasure
- Prescription images EXIF stripped
- ALL 4 pharmacy documents must be approved before pharmacy is approved
