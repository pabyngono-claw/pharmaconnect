# PharmaConnect — Screen 04: Home / My Requests

**File:** `frontend/screens/04-home-my-requests-screen.md`  
**Role:** Patient  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Display the patient's active requests and provide quick access to request details and creation.

## API bindings

- `GET /requests?status=submitted`

## Primary actions

- Open a request
- Create a new request
- Refresh the list
- Navigate to reservations, notifications, or profile

## Layout

- Greeting and page title
- Scrollable request-card list
- Floating action button: Nouvelle demande
- Bottom navigation

## Data shown

- Request title or first requested item
- Request type
- Created date
- Current status
- Number of pharmacy responses
- Expiry or reservation indicator when applicable

## States

- Loading skeletons
- Empty state with Nouvelle demande CTA
- Success list
- API error with Réessayer
- Offline banner with cached data when available

## Navigation

- Card → Screen 06 Request Detail
- FAB → Screen 05 New Request
- Bottom navigation → Reservations / Notifications / Profile

## Acceptance

- Requests appear newest first
- Each card opens the correct request
- Refresh reloads data
- Empty and error states work
- Expired authentication returns the user to Login

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
