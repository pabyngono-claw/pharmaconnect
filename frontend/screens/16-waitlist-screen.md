# PharmaConnect — Screen 16: Waitlist

**File:** `frontend/screens/16-waitlist-screen.md`  
**Role:** Pharmacy  
**Authentication:** Bearer  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Display patients waiting for unavailable products and support follow-up when stock becomes available.

## API bindings

- `GET /pharmacies/:id/waiting-list`

## Primary actions

- Review waiting entries
- Filter by medicine or status
- Open related request
- Notify or fulfill when backend action is available

## Layout

- Header
- Search/filter controls
- Waitlist entries
- Status indicator

## Data shown

- Medicine
- Dosage
- Quantity
- Patient reference
- Waiting since
- Notification count
- Status

## Business rules

- Only pharmacy-relevant entries appear
- Expired and cancelled records are separated
- Notification actions must not spam the same patient

## States

- Loading
- Empty
- Success
- Error

## Navigation

- Entry → related request or future waitlist detail

## Acceptance

- Entries display correct medicine and patient context
- Statuses are accurate
- Filters work
- Expired entries are not shown as active
- Pharmacy isolation is enforced

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
