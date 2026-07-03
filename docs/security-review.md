# Security Review — PharmaConnect v2.0

Equivalent: `/cso`

## Scope

- Auth (OTP + OAuth)
- Payments (Orange Money / Wave webhooks)
- Prescription image handling
- API exposure
- Staff scoping

## Threats and Mitigations

### OTP Plaintext
- Risk: logs or payloads expose codes
- Mitigation: codes hashed at rest; never log code values
- Check: grep backend for `code` output; ensure hashing before write

### OTP Brute Force
- Risk: unlimited attempts
- Mitigation: 5 attempts lockout, 3 per phone per 10 min

### Session Hijacking
- Risk: stolen access tokens
- Mitigation: 15-min access tokens, 30-day rotating refresh tokens
- Check: refresh token rotation enforced after use

### Prescription EXIF
- Risk: location metadata leaks patient address
- Mitigation: EXIF stripping on upload before storage

### Payment Fraud / Replay
- Risk: replay webhook causes duplicate charge
- Mitigation: unique provider_transaction_id; idempotent webhook handler

### Missing Scoping
- Risk: pharmacy staff sees all org data
- Mitigation: staff scoped by pharmacy_id via join; 403 on cross-pharmacy access

### SQLi / NoSQLi
- Risk: unsanitized search inputs
- Mitigation: Xano parameterized queries only; no raw query composition in app layer

### Upload Limits
- Risk: oversized files eat bandwidth
- Mitigation: size limit and type allowlist enforced server-side

### Rate Limits
- Risk: fan-out abuse
- Mitigation: request broadcast rate limits; auth endpoints protected

## Compliance Notes

- CPDP / Loi n° 2008-12: soft delete + anonymize for right to erasure
- Data retention: enforce TBD-CONFIG; default 36 months
- Healthcare data classification: brand prescription images as sensitive

## Required Before Ship

- `/cso` manual audit on OTP, payments, prescriptions
- Failed auth audit -> ticket for `/investigate`
- Payment webhook replay test passes
- Document upload EXIF stripping verified
