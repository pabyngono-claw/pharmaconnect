# Xano Implementation Execution Guide — PharmaConnect v2.0

Owner: backend-eng
Approval: required before any destructive mutation
Source of truth: `backend/xano/schema.sql`, `backend/xano/api-groups-setup.md`
Estimated setup time: 60-90 minutes

## Pre-requisites
- Xano workspace available: https://x8ki-letl-twmt.n7.xano.io
- Admin/Maker access in workspace
- FlutterFlow/Xano file storage bucket for prescription images
- Cloudflare account for secrets + optional worker
- Cloudflare Worker secrets configured: `XANO_API_URL` + `XANO_API_TOKEN`
- Webhook provider secrets: `WEBHOOK_PROVIDER_SECRETS` containing `{"orange_money":"...","wave":"..."}`
- Optional: Postman/Thunder Client collection from `docs/api-snapshot.md`

## Step 1: Schema Deployment
Option A: Schema import
- In Xano Console: Database -> Import -> paste `backend/xano/schema.sql` content
- Run import; Xano will create enums/tables/indexes
- Validate count: 21 tables + indexes present
- Validate enum names and casing exactly as in `references/schema-full.md`

Option B: Manual execution (if import unavailable)
- Open Console -> Database -> Query
- Paste sections in this order:
  1. ENUMS
  2. TABLES
  3. INDEXES
  4. TRIGGERS
- Execute each block individually; fix errors before proceeding to next block

Validation query to run after import:
```
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```
Expected: 21 user tables plus Xano metadata tables

## Step 2: Cube/File Storage Setup
1. Files > New bucket: `prescriptions`
2. Permissions:
   - Public: none
   - Authenticated user: read own files only
   - Admin: read all
3. Max file size: 5MB
4. Allowed extensions: jpg, jpeg, png, pdf
5. Enable client-side EXIF note in metadata (actual stripping via Lambda)

## Step 3: API Groups + Functions
1. Open API Groups page in Xano
2. Create API Groups exactly matching `backend/xano/api-groups-setup.md`:
   - auth, requests, reservations, pharmacies, admin, webhooks, jobs
3. For each group, create routes + functions by copying the spec sections
4. Implement logic roughly per the pseudocode; exact SQL/JS can be adapted
5. In each function, set CORS allowed origins:
   - Cloudflare Worker domain
   - FlutterFlow web domain
6. Set auth requirements per group (public/access/refresh/pharmacy/admin/provider)
7. Set error envelope globally if supported, or per-function

## Step 4: Push Notifications Setup
1. Project > Integrations > Firebase Cloud Messaging
2. Upload service account key from Firebase Console
3. Verify FCM v1 token format in FlutterFlow app
4. Test with device token from patient app

## Step 5: Scheduled Jobs
Open `backend/xano/scheduled-jobs-execution.md` and create 5 jobs in Xano Scheduler:
1. expire-requests: every 15 min
2. expire-reservations: every 5 min
3. expire-waiting-lists: every 15 min
4. renew-subscriptions: daily at 09:00 UTC
5. prune-push-tokens: weekly Sunday 04:00 UTC

For each job:
- Set name exactly
- Set frequency exactly
- Set internal endpoint to `/jobs/<job-name>`
- Protect with admin/internal API key header if available

## Step 6: Webhook Contracts
Not required for schema. Behavior is handled inside Xano functions.

## Step 7: Environment Variables in Xano
Add these via Project Settings > Environment Variables:
Required:
- SMS_PROVIDER_API_KEY
- SMS_PROVIDER_SENDER
- GOOGLE_OAUTH_CLIENT_ID
- FIREBASE_SERVICE_ACCOUNT_JSON
Optional:
- ALLOWED_ORIGINS (comma-separated)
- ADMIN_API_KEY (for scheduler jobs if needed)

## Step 8: Security Configuration
1. Enable Row Level Security on Xano if available
2. Verify pharmacy_staff enforces pharmacy_id matching
3. Verify admin middleware on admin API group
4. Set rate limits on auth endpoints
5. Enable audit logging in all mutations
6. Confirm password/OTP/token fields are not marked as logsafe in frontend

## Step 9: Verification Checklist
- [ ] 21 tables present matching schema names
- [ ] 21+ indexes present on high-cardinality columns
- [ ] `update_updated_at_column` trigger active
- [ ] API Groups deployed: auth, requests, reservations, pharmacies, admin, webhooks, jobs
- [ ] `/auth/otp/request` returns `masked_phone` + `cooldown_seconds`
- [ ] `/auth/otp/verify` returns `access_token`, `refresh_token`, `user_id`
- [ ] `/requests` requires auth unless explicitly public
- [ ] `/pharmacies/:id/requests?near=true` returns geo-sorted pharmacies
- [ ] `/jobs/expire-requests` exists and updates expired requests
- [ ] `/jobs/expire-reservations` exists and updates expired reservations
- [ ] `/webhooks/payments/:provider` accepts body with `provider_transaction_id`
- [ ] File bucket `prescriptions` exists with correct permissions
- [ ] Environment variables configured and not exposed in frontend-facing logs

## Step 10: Manual End-to-End Smoke Test
1. Request OTP: POST /auth/otp/request {"phone": "+2217XYYYYZZZ"}
2. Verify OTP: POST /auth/otp/verify {"phone": "+2217XYYYYZZZ", "code": "123456"}
3. Create request: POST /requests with auth header
4. List pharmacies: GET /pharmacies?near=true&lat=14.7&lng=-17.4
5. Create reservation: POST /reservations with idempotency header
6. Upload document: POST /pharmacy-documents with multipart to `prescriptions` bucket
7. Admin approve document: POST /pharmacy-documents/:id/approve with admin token
8. Simulate payment webhook: POST /webhooks/payments/orange_money
9. Run job: POST /jobs/expire-requests with admin token
10. Search audit trail: GET /audit-logs?entity_type=requests

## Step 11: Worker Webhook Smoke Test
Replace placeholders below before running.

Direct:
```bash
curl -sS -X POST 'https://<worker-host>/webhooks/payments/orange_money' \
  -H 'content-type: application/json' \
  -d '{"provider_transaction_id":"local-test-001","status":"succeeded","amount":1000}'
```

Idempotency check:
```bash
curl -sS -X POST 'https://<worker-host>/webhooks/payments/orange_money' \
  -H 'content-type: application/json' \
  -d '{"provider_transaction_id":"local-test-001","status":"failed","amount":1000}'
```

Expected: second call returns same transaction_id and original status unchanged.

If 401/403: verify `WEBHOOK_PROVIDER_SECRETS` and signature middleware in Worker or Xano.
If provider not unknown: ensure provider path matches exactly `orange_money` or `wave`.

## Rollback / Recovery
- Xano DB backup: Project Settings > Backup > Download backup
- Any API function version history is preserved in Xano
- Rollback a function: open function history, revert to prior version, save
- To reset demo data: truncate all tables and re-run seed script below
