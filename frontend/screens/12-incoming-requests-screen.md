# PharmaConnect — Screen 12: Incoming Requests

**File:** `frontend/screens/12-incoming-requests-screen.md`  
**Role:** Pharmacy  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

List patient requests sent to the pharmacy that require review or response.

## API bindings

- `GET /pharmacies/:id/requests?status=sent`

## Primary actions

- Open request
- Filter by status or urgency
- Refresh queue

## Layout

- Header
- Filter chips
- Request list
- Unanswered indicator

## Data shown

- Request type
- Requested product summary
- Patient area when permitted
- Time received
- Priority
- Current pharmacy response state

## Business rules

- Newest or urgent requests appear first
- Patient-sensitive data is minimized
- Responded requests leave the pending view or change state

## States

- Loading
- Empty queue
- Success
- Error
- Offline

## Navigation

- Request → Screen 13 Respond to Request

## Acceptance

- Only assigned requests appear
- Urgency is visible
- Filters work
- Opening passes correct request ID
- Queue updates after response

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
