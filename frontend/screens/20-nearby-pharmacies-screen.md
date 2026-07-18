# PharmaConnect — Screen 20: Nearby Pharmacies

**File:** `frontend/screens/20-nearby-pharmacies-screen.md`  
**Role:** Public  
**Authentication:** Public  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Help any user discover nearby pharmacies through a map and list without signing in.

## API bindings

- `GET /pharmacies/nearby?lat&lng&radius_km&open_now`

## Primary actions

- Allow location access
- Choose radius
- Toggle open now
- Switch map/list
- Open pharmacy details

## Layout

- Location/search header
- Radius chips: 5–25 km
- Open now filter
- Map/list switcher
- Pharmacy results

## Data shown

- Pharmacy name
- Distance
- Address or quartier
- Open/closed status
- On-garde status
- Phone

## Business rules

- Location denial falls back to manual area search
- Distances are based on supplied coordinates
- Public endpoint exposes no private data

## States

- Requesting location
- Location denied
- Loading
- No results
- Success
- Error

## Navigation

- Pharmacy result → Screen 21 Public Pharmacy Detail

## Acceptance

- Radius and open-now filters affect results
- Map and list represent same data
- Manual fallback works
- Details open correctly
- No authentication is required

## Shared implementation requirements

- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48x48 dp touch targets.
- Handle loading, empty, success, error states.
- No authentication or idempotency key required -- screen is public.
