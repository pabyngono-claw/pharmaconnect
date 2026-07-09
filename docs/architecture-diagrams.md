# System Architecture Diagrams — PharmaConnect v2.0

Use these Mermaid diagrams in docs, PRs, and onboarding.

## E2E: OTP + request + reservation

```mermaid
sequenceDiagram
  autonumber
  actor Patient
  participant App as FlutterFlow App
  participant Worker as Cloudflare Worker
  participant Xano as Xano API

  Patient->>App: Saisit telephone
  App->>Worker: POST /auth/otp/request {phone}
  Worker->>Xano: POST /auth/otp/request {phone}
  Xano-->>Worker: {masked_phone, cooldown_seconds}
  Worker-->>App: {masked_phone, cooldown_seconds}
  App->>Patient: Affiche cooldown

  Patient->>App: Saisit code OTP
  App->>Worker: POST /auth/otp/verify {phone, code}
  Worker->>Xano: POST /auth/otp/verify {phone, code}
  Xano-->>Worker: {access_token, refresh_token, user_id}
  Worker-->>App: {access_token, refresh_token, user_id}

  App->>Worker: POST /requests {product_type, notes, quantity}
  Worker->>Xano: POST /requests {product_type, notes, quantity}
  Xano-->>Worker: request_id, status=submitted
  Worker-->>App: request_id, status=submitted

  App->>Worker: GET /pharmacies?near=true&lat=14.7167&lng=-17.4677
  Worker->>Xano: GET /pharmacies?near=true&lat=14.7167&lng=-17.4677
  Xano-->>Worker: pharmacies[]
  Worker-->>App: pharmacies[]

  App->>Worker: POST /reservations {request_id, pharmacy_id}
  Worker->>Xano: POST /reservations {request_id, pharmacy_id}
  Xano-->>Worker: reservation_id, status=reserved
  Worker-->>App: reservation_id, status=reserved
```

## Payment webhook idempotency

```mermaid
sequenceDiagram
  autonumber
  actor Provider
  participant Worker as Cloudflare Worker
  participant Xano as Xano API

  Provider->>Worker: POST /webhooks/payments/orange_money
  Worker->>Worker: verify signature / parse body
  Worker->>Xano: POST /webhooks/payments/orange_money
  Xano-->>Worker: transaction_id, status=succeeded
  Worker-->>Provider: 200 OK

  Provider->>Worker: Retry same provider_transaction_id
  Worker->>Xano: POST /webhooks/payments/orange_money
  Xano-->>Worker: transaction_id, status=succeeded (unchanged)
  Worker-->>Provider: 200 OK
```

## Scheduler jobs

```mermaid
flowchart LR
  A[expire-requests every 15m] --> A1[Update requested->expired on timeout]
  B[expire-reservations every 5m] --> B1[Update reserved->expired on hold timeout]
  C[expire-waiting-lists every 15m] --> C1[Remove stale waiting rows]
  D[renew-subscriptions daily 09:00 UTC] --> D1[Create trial_to_active / past_due notices]
  E[prune-push-tokens weekly Sunday 04:00 UTC] --> E1[Delete invalid stale tokens]
```

## Data ownership boundary

```mermaid
flowchart LR
  A[Patient App] -->|read/write| B[Xano API]
  C[Pharmacy App] -->|read/write| B
  D[Admin App] -->|read/write| B
  B -->|webhooks| E[Orange Money / Wave]
  B -->|schedule| F[Xano Scheduler]
  G[Cloudflare Worker] -->|proxy| B
  A -->|api| G
  C -->|api| G
  D -->|api| G
```