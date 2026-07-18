# PharmaConnect — Screen 21: Public Pharmacy Detail

**File:** `frontend/screens/21-public-pharmacy-detail-screen.md`  
**Role:** Public  
**Authentication:** Public  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Show public pharmacy information, hours, on-garde status, and contact/navigation actions.

## API bindings

- `GET /pharmacies/:id`
- `GET /pharmacies/:id/hours`

## Primary actions

- Call pharmacy
- Open WhatsApp
- Get directions
- Review hours

## Layout

- Pharmacy header
- Open/on-garde status
- Contact actions
- Address and map
- Weekly hours

## Data shown

- Name
- Address
- Phone
- WhatsApp
- Coordinates
- Opening hours
- On-garde status
- Verification indicator when public

## Business rules

- Actions use available contact data only
- Closed status uses current local time and configured hours
- No inventory or patient data is exposed

## States

- Loading
- Success
- Missing hours
- Error
- Pharmacy unavailable

## Navigation

- Back → Nearby Pharmacies
- External → phone, WhatsApp, or maps

## Acceptance

- Correct pharmacy loads
- Hours render by day
- Open/closed status is understandable
- Contact actions work
- Public privacy boundaries are respected

## Shared implementation requirements

- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48x48 dp touch targets.
- Handle loading, empty, success, error states.
- No authentication or idempotency key required -- screen is public.
