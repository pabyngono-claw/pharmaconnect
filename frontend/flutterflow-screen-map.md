# PharmaConnect — FlutterFlow Screen Map & API Bindings

**Backend frozen as of July 17, 2026.** Production hardening (indexes, rate limits,
transactions) deferred to post-FF integration. All screens connect to existing
Xano APIs documented in `backend/xano/xano-api-spec.md` and
`backend/xano/xano-ff-integration-guide.md`.

**API Base URL:** TBD — Xano workspace URL (configure in FF Project Settings)
**Auth:** Bearer token, 15 min access, 30-day rotating refresh
**Idempotency-Key:** Required on all POST/PUT/PATCH/DELETE (generate UUID v4 client-side)

---

## Phase 1 — Application Patient (9 screens)

| # | Screen | API Calls | Auth | Notes |
|---|--------|-----------|------|-------|
| 1 | **Splash** | Check stored tokens | — | Route to Home if valid, Login if not |
| 2 | **Login (Phone)** | `POST /auth/otp/request` | Public | Phone input, cooldown timer |
| 3 | **OTP Verify** | `POST /auth/otp/verify` | Public | Store tokens, navigate to Home |
| 4 | **Home / My Requests** | `GET /requests?status=submitted` | Bearer | Active list + FAB to create |
| 5 | **New Request** | `POST /requests` | Bearer | Product type picker, notes, images |
| 6 | **Request Detail** | `GET /requests/:id` | Bearer | Responses, reserve button |
| 7 | **Reservations List** | `GET /reservations` | Bearer | Active + history tabs |
| 8 | **Reservation Detail** | `GET /reservations/:id`, `POST /reservations/:id/cancel` | Bearer | Timeline, cancel action |
| 9 | **Notifications** | `GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all` | Bearer | Inbox |

### Shared — App shell
| — | **Bottom Nav** | — | Bearer | 3-4 tabs: Home, Reservations, Notifications, Profile |

---

## Phase 2 — Pharmacie (11 screens)

| # | Screen | API Calls | Auth | Notes |
|---|--------|-----------|------|-------|
| 10 | **Pharmacy Login** | `POST /auth/otp/request` + `POST /auth/otp/verify` | Public | Same flow, scoped to pharmacy role |
| 11 | **Pharmacy Dashboard** | `GET /pharmacies/:id/requests`, `GET /reservations?status=submitted` | Bearer | Incoming count, active reservations, waitlist |
| 12 | **Incoming Requests** | `GET /pharmacies/:id/requests?status=sent` | Bearer | List of pending requests |
| 13 | **Respond to Request** | `POST /responses` | Bearer | Price, quantity, TVA, accept/reject |
| 14 | **Active Reservations** | `GET /reservations?status=submitted,ready` | Bearer | Mark ready, mark served |
| 15 | **Pharmacy Reservation Detail** | `GET /reservations/:id`, `POST /reservations/:id/mark-ready`, `POST /reservations/:id/mark-served` | Bearer | Action buttons |
| 16 | **Waitlist** | `GET /pharmacies/:id/waiting-list` | Bearer | Queue of waiting patients |
| 17 | **Pharmacy Profile** | `GET /pharmacy/me`, `PUT /pharmacy/me`, `GET /pharmacy/me/documents`, `POST /pharmacy/me/documents` | Bearer | Edit info, upload docs |
| 18 | **Inventory** | `GET /inventory`, `POST /inventory`, `PUT /inventory/:id`, `POST /inventory/adjust` | Bearer | CRUD + stock adjustment |
| 19 | **Pharmacy Notifications** | `GET /notifications`, `POST /notifications/:id/read` | Bearer | Same as patient but pharmacy-scoped |

---

## Phase 3 — Découverte Publique (2 screens, no auth)

| # | Screen | API Calls | Auth | Notes |
|---|--------|-----------|------|-------|
| 20 | **Nearby Pharmacies** | `GET /pharmacies/nearby?lat&lng&radius_km&open_now` | Public | Map + list view |
| 21 | **Public Pharmacy Detail** | `GET /pharmacies/:id`, `GET /pharmacies/:id/hours` | Public | Profile, hours, on-garde status |

---

## Build Order (recommended)

1. **Splash** → **Login** → **OTP** — auth foundation
2. **Home / My Requests** → **New Request** — core patient action
3. **Request Detail** (with pharmacy responses) → **Reservations List** → **Reservation Detail** — reservation flow
4. **Pharmacy Login** → **Dashboard** → **Incoming Requests** → **Respond** — pharmacy response flow
5. **Active Reservations** → **Reservation Detail (Pharmacy)** — fulfillment flow
6. **Notifications** — both roles
7. **Pharmacy Profile** → **Inventory** — management
8. **Nearby Pharmacies** → **Public Pharmacy Detail** — discovery
9. **Waitlist** — waitlist flow

---

**Next:** Commençons par l'écran **Splash** (Phase 1, écran 1). Je vais produire la specification complète — UI, state machine, API binding, variables FlutterFlow.