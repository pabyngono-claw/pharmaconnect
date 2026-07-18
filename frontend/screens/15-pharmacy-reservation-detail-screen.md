# PharmaConnect — Screen 15: Pharmacy Reservation Detail

**File:** `frontend/screens/15-pharmacy-reservation-detail-screen.md`  
**Role:** Pharmacy  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Let pharmacy staff manage a reservation from confirmation through pickup.

## API bindings

- `GET /reservations/:id`
- `POST /reservations/:id/mark-ready`
- `POST /reservations/:id/mark-served`

## Primary actions

- Review reservation
- Mark Ready
- Mark Served
- Reject or cancel when supported by backend policy

## Layout

- Status header
- Patient and reservation information
- Items and totals
- Timeline
- Action buttons

## Business rules

- Mark Ready is available only from valid prior states
- Mark Served requires confirmation
- Actions are idempotent
- Status transitions follow backend rules

## States

- Pending
- Confirmed
- Ready
- Collected/Served
- Cancelled
- Expired
- Error

## Navigation

- Back → Active Reservations

## Acceptance

- Transitions are valid and persisted
- Buttons change with status
- Confirmation prevents accidental completion
- Patient receives backend notification
- Repeated taps do not duplicate transitions

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
