# PharmaConnect — Screen 05: New Request

**File:** `frontend/screens/05-new-request-screen.md`  
**Role:** Patient  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Allow a patient to create a product, prescription-refill, or medical-equipment request.

## API bindings

- `POST /requests`

## Primary actions

- Choose request type
- Enter request details
- Attach images
- Select distance and pharmacies when required
- Submit request

## Layout

- Request-type selector
- Dynamic form
- Image upload area
- Notes field
- Pharmacy selection summary
- Submit button

## Fields

- Product: name, dosage, quantity, brand preference, substitution allowed
- Prescription: prescription image, notes
- Equipment: equipment name, quantity, notes
- Distance: 5, 10, 15, 20, or 25 km

## Validation

- Request type required
- At least one meaningful item or image required
- Quantity must be positive
- Image type and size validated
- Prevent duplicate submission

## States

- Initial form
- Uploading attachment
- Submitting
- Validation errors
- Submission failure
- Success and navigation to Request Detail

## Navigation

- Back → Home
- Successful submission → Screen 06 Request Detail

## Acceptance

- Correct fields appear for each request type
- Invalid forms cannot submit
- Idempotency key is sent
- Attachments upload successfully
- Successful request is visible on Home

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
