# PharmaConnect — Screen 19: Pharmacy Notifications

**File:** `frontend/screens/19-pharmacy-notifications-screen.md`  
**Role:** Pharmacy  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Show pharmacy alerts for new requests, reservations, cancellations, waitlist events, and admin messages.

## API bindings

- `GET /notifications`
- `POST /notifications/:id/read`

## Primary actions

- Open notification
- Mark as read
- Refresh list

## Layout

- Header and unread count
- Notification list
- Filter by type when useful

## Data shown

- Type
- Title
- Message
- Timestamp
- Unread state

## Business rules

- Opening marks read
- Target links open pharmacy-scoped records
- Unread count updates immediately

## States

- Loading
- Empty
- Success
- Error
- Offline cached notifications

## Navigation

- Notification → request, reservation, waitlist, or profile target

## Acceptance

- Unread state persists
- Deep links work
- Counter is dynamic
- Only pharmacy notifications appear
- Refresh loads new events

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
