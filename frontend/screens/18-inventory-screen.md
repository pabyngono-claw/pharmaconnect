# PharmaConnect — Screen 18: Inventory

**File:** `frontend/screens/18-inventory-screen.md`  
**Role:** Pharmacy  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Manage pharmacy stock records and availability.

## API bindings

- `GET /inventory`
- `POST /inventory`
- `PUT /inventory/:id`
- `POST /inventory/adjust`

## Primary actions

- Search inventory
- Add medicine
- Edit item
- Adjust stock
- Mark unavailable

## Layout

- Search bar
- Stock summary
- Inventory list
- Add button
- Adjustment modal

## Data shown

- Medicine name
- Brand
- Strength
- Dosage form
- Quantity
- Minimum level
- Unit price
- Expiry
- Availability

## Validation

- Medicine required
- Quantity integer and non-negative
- Price non-negative
- Expiry date valid
- Adjustment reason required

## States

- Loading
- Empty inventory
- Success
- Add/edit form
- Adjustment in progress
- Error

## Navigation

- Item → edit view
- Add button → item form

## Acceptance

- CRUD operations persist
- Adjustments record previous and new quantities
- Low stock is highlighted
- Search works
- Availability reflects stock rules

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
