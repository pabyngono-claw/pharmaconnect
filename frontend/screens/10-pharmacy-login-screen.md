# PharmaConnect — Screen 10: Pharmacy Login

**File:** `frontend/screens/10-pharmacy-login-screen.md`  
**Role:** Pharmacy  
**Authentication:** Public  
**Status:** V1 implementation specification  
**Last updated:** 2026-07-18

## Purpose

Authenticate pharmacy owners and staff with OTP and enforce pharmacy-role access.

## API bindings

- `POST /auth/otp/request`
- `POST /auth/otp/verify`

## Primary actions

- Enter phone number
- Request OTP
- Verify OTP
- Resend after cooldown

## Layout

- Pharmacy branding
- Phone form
- OTP form or second step
- Help text

## Validation

- Valid phone required
- OTP length required
- Cooldown enforced
- Role must be Pharmacy Owner or Pharmacy Staff

## States

- Phone entry
- OTP sent
- Verifying
- Invalid OTP
- Expired OTP
- Locked after too many attempts
- Success

## Navigation

- Success → Screen 11 Pharmacy Dashboard

## Acceptance

- OTP request and verification work
- Tokens are stored securely
- Non-pharmacy users cannot enter portal
- Resend timer works
- Errors are understandable

## Shared implementation requirements

- Send `Authorization: Bearer <access_token>` on protected endpoints.
- Send a UUID v4 `Idempotency-Key` on write requests.
- Show user-friendly French messages; do not expose raw backend errors.
- Preserve safe-area spacing and minimum 48×48 dp touch targets.
- Handle loading, empty, success, error, and expired-session states.
- Refresh displayed data after any successful write action.
