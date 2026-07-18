# PharmaConnect — Screen 13: Respond to Request

**File:** `frontend/screens/13-respond-to-request-screen.md`  
**Role:** Pharmacy  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Allow a pharmacist to report availability, quantities, prices, readiness, and notes.

## API bindings

- `POST /responses`

## Primary actions

- Choose response status
- Enter available quantity and price
- Add pharmacist notes
- Set estimated ready time
- Submit response

## Layout

- Patient request summary
- Per-item availability controls
- Pricing section
- Notes
- Submit button

## Fields

- Available / Partially Available / Not Available
- Quantity
- Unit or total price
- TVA where applicable
- Estimated ready and pickup times
- Notes

## Validation

- Status required
- Available quantity cannot be negative
- Price required for available items
- Ready time must be in the future when supplied

## States

- Editing
- Validation errors
- Submitting
- Success
- Failure

## Navigation

- Success → Incoming Requests or request detail

## Acceptance

- Response is linked to correct request and pharmacy
- Partial availability is supported
- Invalid prices and quantities are blocked
- Patient notification is triggered by backend workflow
- Duplicate submissions are prevented

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
