# PharmaConnect v2.0 — Project Wiki

Senegal-focused pharmacy connectivity platform: patients submit prescription/product requests,
pharmacies respond, and reservations manage the handoff.

## Stack

- Backend: Xano (21 tables, 40+ endpoints, 5 scheduled tasks)
- Frontend: FlutterFlow (Android + iOS + Web)
- Auth: WhatsApp OTP + Google OAuth
- Push: Firebase Cloud Messaging
- Maps: Google Maps + server-side Haversine geo-search
- Payments: Orange Money + Wave
- Storage: Xano file storage + Lambda re-encoding
- Hosting: Cloudflare Workers static assets
- QA: gstack (/qa, /qa-only, /review, /design-review)
- Security: gstack /cso
- Release: gstack /ship + /land-and-deploy

## Canonical Patient Journey

Discovery → Prescription upload → Pharmacy selection → Receive responses → Reserve → Collect → Return

## Canonical Pharmacy Journey

Register + upload documents → Admin approval → Receive requests → Respond → Mark ready/served → Serve next waiting patient

## Team (gstack skills)

- Product/CEO: `/plan-ceo-review`
- Eng Manager: `/plan-eng-review`
- Designer: `/design-consultation`, `/design-review`
- Frontend Lead: `/plan-design-review`
- QA Lead: `/qa`, `/qa-only`
- Security Officer: `/cso`
- Release Engineer: `/ship`, `/land-and-deploy`
- Debugger: `/investigate`
- Docs Lead: `/document-release`
- Retro Lead: `/retro`

## Skill Routing

When a request matches an available skill, invoke it first.

- New idea / is it worth building / brainstorm → `/office-hours`
- Bugs / errors / "why is this broken" → `/investigate`
- Ship / deploy / push / create PR → `/ship`
- QA / test the site / find bugs → `/qa`
- Code review / check my diff → `/review`
- Architecture review → `/plan-eng-review`
- Strategy / scope / ambition → `/plan-ceo-review`
- Design system / brand / visual identity → `/design-consultation`
- Visual audit / design polish → `/design-review`
- Update docs after shipping → `/document-release`
- Weekly retro → `/retro`
- Security audit (auth / payments / webhooks) → `/cso`

## Workflow Sequence

1. `/plan-ceo-review` — lock vision and scope
2. `/plan-eng-review` — lock architecture and data flow
3. `/design-consultation` — tokens, brand, guardrails
4. `/plan-design-review` — rate each screen 0–10
5. Build (FlutterFlow screens + Xano schema/functions)
6. `/review` — pre-landing diff review
7. `/qa` or `/qa-only` — browser + API regression
8. `/cso` — OWASP/STRIDE on auth, payments, prescriptions
9. `/ship` + `/land-and-deploy` — release with evidence
10. `/document-release` — sync docs
11. `/retro` — cadence

## Quality Standards

- All touch targets >= 48x48dp
- WCAG 2.1 AA contrast (4.5:1 normal, 3:1 large)
- No fixed-height text containers
- Test at 2x system font size
- Screen-reader labels on image upload actions
- Loading skeleton matches real row layout on every list screen
- Offline reads cached; writes disabled with explicit message
- Image uploads compressed to max 1600px / JPEG 80 before upload
- Push permission requested post-login, not on launch
- No hardcoded strings

## Critical Rules

- TVA is computed server-side, never client-side
- OTP codes hashed only, never logged
- Reservation mutations require Idempotency-Key
- Payment transactions require unique provider_transaction_id
- Soft delete + anonymize for right to erasure
- Prescription images: EXIF stripping mandatory
- Pharmacy approval requires ALL 4 documents approved
- No overlapping writes to shared files without worktree isolation

## Critical Pitfalls

1. Custom Auth using Firebase Auth -> OTP impossible. Must use backend auth.
2. Missing operational tables -> Multi-branch, OTP, refresh tokens, payments, audit, support break.
3. API error handling = toast only -> OTP cooldown timer missing, race messages missing, field-level errors absent.
4. Regulatory filing deferred -> Launch-blocking.
5. Payment agreements late -> Integration timelines underestimated; start early.
6. Pilot only with tech-savvy -> Accessibility bugs ship for elderly personas.
7. Financial math client-side -> Integrity failure.
8. OTP codes plaintext -> Security violation.
9. Auth provider cold-start ignored -> Budget for latency.
10. No idempotency on reservations/payments -> Double-bookings and duplicate charges.

## Regulatory Defaults

- Personal data: right to erasure = soft delete + anonymize
- Prescription images: EXIF stripping mandatory
- Tax calculation: itemized on every transaction
- CPDP compliance: Loi n° 2008-12 data handling rules apply
- Data retention: project-specific TBD-CONFIG

## Budget Scenarios

- Bootstrap minimum: founder does pilot coordination, minimal QA
- Recommended lean: dedicated QA, legal, 10% contingency
- Agency full: single accountability, premium freelancers

Calculate break-even against subscription pricing and conversion rate before committing hosting tiers.
