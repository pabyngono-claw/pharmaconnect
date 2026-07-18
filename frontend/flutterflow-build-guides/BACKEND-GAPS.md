# PharmaConnect -- Consolidated Backend Gaps

- **Screen 06 — Request Detail:** GET /requests/:id is confirmed. Reservation creation uses POST /reservations.
- **Screen 07 — Reservations List:** GET /reservations is absent from the frozen Xano API specification.
- **Screen 08 — Reservation Detail:** GET /reservations/:id is absent; cancel is confirmed.
- **Screen 09 — Notifications:** Notification endpoints are absent from the frozen Xano API specification.
- **Screen 10 — Pharmacy Login:** auth.verify-otp does not return role or pharmacy_id; add them or add a profile lookup.
- **Screen 11 — Pharmacy Dashboard:** GET /reservations list and dashboard aggregate counts are absent.
- **Screen 13 — Respond to Request:** Frozen API does not support status, notes, ready time or per-item responses.
- **Screen 14 — Active Reservations:** GET /reservations list is absent and must enforce pharmacy scoping.
- **Screen 15 — Pharmacy Reservation Detail:** GET /reservations/:id and pharmacy reject/cancel are absent.
- **Screen 16 — Waitlist:** Notify/fulfill mutation is absent; confirmed endpoint returns ready queue only.
- **Screen 17 — Pharmacy Profile:** All pharmacy profile/document endpoints are absent.
- **Screen 18 — Inventory:** Inventory endpoints are absent.
- **Screen 19 — Pharmacy Notifications:** Notification endpoints are absent.
- **Screen 20 — Nearby Pharmacies:** Public nearby endpoint is absent.
- **Screen 21 — Public Pharmacy Detail:** Public pharmacy detail and hours endpoints are absent.
