# PharmaConnect — Screen 06: Request Detail

**File:** `frontend/screens/06-request-detail-screen.md`  
**Role:** Patient  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Show a request's details, pharmacy responses, and the next action available to the patient.

## API bindings

- `GET /requests/:id`

## Primary actions

- Review request details
- Expand pharmacy responses
- Reserve an available response
- Join a waitlist when unavailable
- Cancel or delete when permitted

## Layout

- Status header
- Request information card
- Requested-items list
- Pharmacy responses list
- Sticky primary action area

## Data shown

- Request type and items
- Images and notes
- Selected pharmacies
- Response status, price, quantity, readiness time, pharmacist notes
- Request expiry

## Business rules

- Only available or partially available responses can be reserved
- One response may be selected for reservation
- Unavailable responses may offer waitlist
- Confirmation is required before destructive actions

## States

- Loading
- No responses yet
- Responses available
- Expired request
- Cancelled request
- Error

## Navigation

- Reserve → Screen 08 Reservation Detail or confirmation flow
- Back → Screen 04 Home

## Acceptance

- Correct request loads by ID
- Responses are pharmacy-specific
- Prices and notes display accurately
- Reservation action uses the selected response
- Unavailable responses do not show an invalid reserve action

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
