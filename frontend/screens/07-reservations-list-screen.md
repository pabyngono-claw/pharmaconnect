# PharmaConnect — Screen 07: Reservations List

**File:** `frontend/screens/07-reservations-list-screen.md`  
**Role:** Patient  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Show active and historical reservations for the signed-in patient.

## API bindings

- `GET /reservations`

## Primary actions

- Switch between Active and History
- Open reservation details
- Refresh reservations

## Layout

- Page header
- Active / History tabs
- Reservation-card list
- Bottom navigation

## Data shown

- Pharmacy name
- Reserved product or summary
- Reservation number
- Status
- Total amount
- Pickup or expiry time

## Business rules

- Active includes Pending, Confirmed, and Ready for Pickup
- History includes Collected, Cancelled, and Expired
- Ready reservations receive visual priority

## States

- Loading
- Empty active tab
- Empty history tab
- Success
- Error
- Offline cached list

## Navigation

- Card → Screen 08 Reservation Detail
- Bottom navigation → Home / Notifications / Profile

## Acceptance

- Tabs filter correctly
- Statuses map to the correct labels
- Cards open correct records
- Ready for Pickup is prominent
- Refresh updates changed statuses

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
