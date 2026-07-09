# Xano Console Quick-Apply — Route + Function Registry

Use this checklist during API Groups creation. One function per section below.
Avoid extra cleanup by copying exact names and behaviors.

## auth
- POST /auth/otp/request -> `auth.request-otp`
- POST /auth/otp/verify -> `auth.verify-otp`
- POST /auth/refresh -> `auth.refresh`
- POST /auth/link -> `auth.link`

## requests
- POST /requests -> `requests.create`
- POST /requests/:id/link -> `requests.link`
- GET /requests/:id -> `requests.get`
- GET /requests -> `requests.list`
- POST /reservations -> `reservations.create`

## pharmacies
- GET /pharmacies/:id/requests -> `pharmacies.nearby-requests`
- POST /responses -> `responses.create`
- GET /pharmacies/:id/waiting-list -> `pharmacies.waiting-list`
- POST /reservations/:id/mark-ready -> `pharmacies.mark-ready`
- POST /reservations/:id/mark-served -> `pharmacies.mark-served`

## admin
- POST /pharmacy-documents/:id/approve -> `admin.approve-document`
- GET /audit-logs -> `admin.audit-logs`
- GET /subscriptions -> `admin.subscriptions`
- PUT /subscriptions/:id -> `admin.subscriptions-update`

## webhooks
- POST /webhooks/payments/orange_money -> `webhooks.payments`
- POST /webhooks/payments/wave -> `webhooks.payments`

## jobs
- POST /jobs/expire-requests -> `jobs.expire-requests`
- POST /jobs/expire-reservations -> `jobs.expire-reservations`
- POST /jobs/expire-waiting-lists -> `jobs.expire-waiting-lists`
- POST /jobs/renew-subscriptions -> `jobs.renew-subscriptions`
- POST /jobs/prune-push-tokens -> `jobs.prune-push-tokens`
