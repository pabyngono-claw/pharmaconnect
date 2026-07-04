# Xano API Snapshot — PharmaConnect v2.0

Organize endpoints as Xano API Groups. Each group routes to an internal function.

## Auth (`/auth`)

| Method | Path | Function | Auth |
|--------|------|----------|------|
| POST | /auth/otp/request | Request OTP | none |
| POST | /auth/otp/verify | Verify OTP | none |
| POST | /auth/refresh | Refresh token | refresh |
| POST | /auth/link | Link provider | access |

## Patients

| Method | Path | Function | Auth |
|--------|------|----------|------|
| POST | /requests | Create request | none |
| POST | /requests/:id/link | Link request after signup | access |
| GET | /requests/:id | Get request | access |
| POST | /reservations | Reserve response | access + idempotency |
| GET | /requests | List patient requests | access |

## Pharmacies

| Method | Path | Function | Auth |
|--------|------|----------|------|
| GET | /pharmacies/:id/requests | Nearby requests | pharmacy |
| POST | /responses | Submit response | pharmacy |
| GET | /pharmacies/:id/waiting-list | Waiting list | pharmacy |
| POST | /reservations/:id/mark-ready | Mark ready | pharmacy |
| POST | /reservations/:id/mark-served | Mark served | pharmacy |

## Admin

| Method | Path | Function | Auth |
|--------|------|----------|------|
| POST | /pharmacy-documents/:id/approve | Approve doc | admin |
| POST | /pharmacy-documents/:id/reject | Reject doc | admin |
| GET | /admin/pharmacies | List pharmacies | admin |
| GET | /admin/requests | List all requests | admin |

## Webhooks/Jobs

| Method | Path | Function | Auth |
|--------|------|----------|------|
| POST | /webhooks/payments/:provider | Payment webhook | provider secret |
| POST | /jobs/expire-requests | Manual backfill | internal |
| POST | /jobs/expire-reservations | Manual backfill | internal |
| POST | /jobs/expire-waiting-lists | Manual backfill | internal |
| POST | /jobs/renew-subscriptions | Manual backfill | internal |
| POST | /jobs/prune-push-tokens | Manual backfill | internal |

## Auth Rules
- access token: 15 min
- refresh token: 30d rotating
- pharmacy scope: pharmacy_id from pharmacy_staff mapping
