# PharmaConnect — Screen 17: Pharmacy Profile

**File:** `frontend/screens/17-pharmacy-profile-screen.md`  
**Role:** Pharmacy  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Allow the pharmacy to review and update business information and required documents.

## API bindings

- `GET /pharmacy/me`
- `PUT /pharmacy/me`
- `GET /pharmacy/me/documents`
- `POST /pharmacy/me/documents`

## Primary actions

- Edit pharmacy details
- Upload documents
- View verification status
- Save changes

## Layout

- Profile header
- Business information form
- Contact and location
- Documents section
- Save button

## Fields

- Name
- License number
- Phone
- WhatsApp
- Email
- Address
- Quartier
- Coordinates
- Documents

## Validation

- Required business fields
- Valid phone/email
- Accepted document types and sizes
- Coordinates or address required for discovery

## States

- Loading
- View mode
- Edit mode
- Uploading
- Saving
- Validation error
- Success
- Backend error

## Navigation

- Back → Dashboard

## Acceptance

- Existing data pre-fills
- Only changed fields are updated
- Documents upload and appear in list
- Verification status is read-only
- Validation prevents invalid save

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
