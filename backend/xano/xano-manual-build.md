# Xano Manual Build Checklist — PharmaConnect v2.0

Use this to build the backend in Xano console. Estimated time: 2-3 hours.

## Phase 1: Database Tables

1. Open Xano console > Database
2. Create tables in dependency order:
   - organizations
   - users
   - pharmacies
   - pharmacy_staff
   - pharmacy_documents
   - pharmacy_hours
   - garde_dates
   - medicine_catalog
   - pharmacy_inventory
   - inventory_update
   - medicine_request
   - request_item
   - request_pharmacies
   - pharmacy_response
   - reservation
   - waitlist
   - notification
   - subscription
   - payment
   - support_ticket
   - system_setting
   - otp_verifications
   - refresh_tokens
   - push_tokens
   - audit_logs

3. For each table, add fields exactly as specified in `xano-native-schema.md`
4. Add relations using Xano relation fields
5. Add indexes listed in `xano-native-schema.md`

## Phase 2: API Groups

1. Open Xano console > API Groups
2. Create API Groups: auth, requests, pharmacies, reservations, admin, webhooks, jobs
3. For each group, create routes and functions as specified in `xano-api-spec.md`
4. Set middlewares/auth rules per group
5. Test each function in Xano's built-in tester

## Phase 3: Scheduled Jobs

1. Open Xano console > Scheduler
2. Create 5 jobs:
   - expire-requests (every 15 min)
   - expire-reservations (every 5 min)
   - expire-waiting-lists (every 15 min)
   - renew-subscriptions (daily 09:00 UTC)
   - prune-push-tokens (weekly Sunday 04:00 UTC)
3. Protect each job with admin/internal API key
4. Configure queries as per `xano-scheduled-jobs-import.md`

## Phase 4: Verification

1. Test auth flow: request OTP, verify, refresh
2. Test request creation and pharmacy fan-out
3. Test response creation and reservation flow
4. Test admin approve/reject documents
5. Test webhook handling
6. Verify scheduler jobs run correctly

## Phase 5: Environment Variables

Set in Xano Environment Variables:
- SMS_PROVIDER_API_KEY
- SMS_PROVIDER_URL
- FCM_SERVER_KEY
- GOOGLE_OAUTH_CLIENT_ID
- ORANGE_MONEY_SECRET
- WAVE_SECRET
- ADMIN_API_KEY

## Important Notes
- OTP codes must be hashed (bcrypt) before storage
- TVA computed server-side
- Reservation mutations require Idempotency-Key header
- Payment provider_transaction_id must be unique
- Prescription image URLs must be pre-signed or Xano file storage URLs
