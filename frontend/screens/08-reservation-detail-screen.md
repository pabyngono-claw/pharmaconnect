# PharmaConnect — Screen 08: Reservation Detail

**File:** `frontend/screens/08-reservation-detail-screen.md`  
**Role:** Patient  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Provide full reservation information, pickup guidance, and cancellation when allowed.

## API bindings

- `GET /reservations/:id`
- `POST /reservations/:id/cancel`

## Primary actions

- View reservation status timeline
- Call, message, or navigate to pharmacy
- Cancel eligible reservation

## Layout

- Success/status card
- Reservation summary
- Pharmacy information
- Pickup details
- Status timeline
- Cancel action

## Data shown

- Reservation number
- Pharmacy
- Product and quantity
- Total price
- Reservation and expiry times
- Pickup time
- Status

## Business rules

- Cancellation requires confirmation
- Collected, Cancelled, and Expired reservations cannot be cancelled
- Ready for Pickup emphasizes directions and contact actions

## States

- Loading
- Pending
- Confirmed
- Ready for Pickup
- Collected
- Cancelled
- Expired
- Error

## Navigation

- Back → Reservations List
- Pharmacy contact actions → device phone/maps/WhatsApp

## Acceptance

- Correct reservation loads
- Timeline reflects status
- Cancel action only appears when valid
- Successful cancellation updates status
- All confirmation details remain visible

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
