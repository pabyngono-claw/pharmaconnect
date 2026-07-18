# PharmaConnect — Screen 09: Notifications

**File:** `frontend/screens/09-notifications-screen.md`  
**Role:** Patient  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Display patient alerts and keep unread counts synchronized.

## API bindings

- `GET /notifications`
- `POST /notifications/:id/read`
- `POST /notifications/read-all`

## Primary actions

- Open a notification
- Mark one as read
- Mark all as read
- Refresh inbox

## Layout

- Header with unread count
- Mark all as read action
- Notification list
- Bottom navigation

## Data shown

- Type icon
- Title
- Message preview
- Relative date/time
- Unread indicator

## Business rules

- Opening marks the item as read
- Unread counter decreases immediately
- Notification tap routes to the related request, reservation, or waitlist when a target exists

## States

- Loading
- Empty inbox
- Success
- Error
- Offline cached notifications

## Navigation

- Related notification → target screen
- Bottom navigation → Home / Reservations / Profile

## Acceptance

- Unread counter is dynamic
- Mark-all updates all visible items
- Read state persists after refresh
- Deep links open correct records
- Empty state displays correctly

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
