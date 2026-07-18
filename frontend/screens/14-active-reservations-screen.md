# PharmaConnect — Screen 14: Active Reservations

**File:** `frontend/screens/14-active-reservations-screen.md`  
**Role:** Pharmacy  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Show reservations requiring pharmacy fulfillment.

## API bindings

- `GET /reservations?status=submitted,ready`

## Primary actions

- Open reservation
- Filter by Pending, Confirmed, or Ready
- Refresh list

## Layout

- Header
- Status tabs or chips
- Reservation list
- Priority ready section

## Data shown

- Reservation number
- Patient identifier
- Product summary
- Quantity
- Total amount
- Pickup or expiry time
- Status

## Business rules

- Expired reservations are removed from active view
- Ready reservations are visually prominent
- Records are scoped to the pharmacy

## States

- Loading
- Empty
- Success
- Error

## Navigation

- Reservation → Screen 15 Pharmacy Reservation Detail

## Acceptance

- Filters map to backend statuses
- Expiring reservations are indicated
- Cards open correct details
- Refresh updates patient cancellation or collection
- No other pharmacy's records appear

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
