# PharmaConnect — Screen 11: Pharmacy Dashboard

**File:** `frontend/screens/11-pharmacy-dashboard-screen.md`  
**Role:** Pharmacy  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Provide an operational summary of incoming requests, reservations, unanswered items, and waitlist activity.

## API bindings

- `GET /pharmacies/:id/requests`
- `GET /reservations?status=submitted`

## Primary actions

- Open incoming requests
- Open active reservations
- Open waitlist
- Open inventory and notifications

## Layout

- Pharmacy header
- Metric cards
- Priority section
- Recent requests
- Bottom or side navigation

## Data shown

- Demandes reçues
- Réservations
- Non répondues
- Listes d'attente
- Ready and served counters

## Business rules

- Counts must reflect live backend data
- Urgent items receive priority
- Only records belonging to the authenticated pharmacy are visible

## States

- Loading metrics
- Success
- Partial-data warning
- Error
- Empty recent activity

## Navigation

- Metrics → Screens 12, 14, or 16
- Profile → Screen 17
- Inventory → Screen 18
- Notifications → Screen 19

## Acceptance

- All counters are dynamic
- Recent items open correctly
- Pharmacy isolation is enforced
- Refresh updates metrics
- Error in one section does not blank the entire dashboard

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
