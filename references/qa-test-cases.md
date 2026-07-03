# QA Test Cases — PharmaConnect v2.0

Exact reproduction steps for each critical QA test.

## TC-01 OTP Rate Limiting

Precondition: User exists with phone +1
Steps:
1. Call POST /auth/otp/request 4 times quickly.
2. Call POST /auth/otp/request a 5th time.
Expected: 429 after 3 per 10 min limit. Lock screen shows cooldown timer.

## TC-02 Duplicate Auth Linking

Precondition: User has WhatsApp OTP account
Steps:
1. Complete Google OAuth link.
2. Call /auth/otp/verify with same phone from another device.
Expected: Both tokens valid; same user_id returned.

## TC-03 Request Expiry

Precondition: New request created with expires_at + 10 min
Steps:
1. Wait past expires_at.
2. Inspect request.status.
Expected: status = expired. Re-broadcast suggestion enabled if no reservation.

## TC-04 Reservation Race Condition

Precondition: Two pharmacy responses for same request
Steps:
1. Submit reservation for response A with idempotency key K.
2. Submit reservation for response B with idempotency key K.
3. Submit reservation for response B without idempotency key.
Expected: First request creates reservation. Second/missing key return 409 or 422.

## TC-05 Reservation Hold Expiry

Precondition: Reservation in READY state with hold_expires_at soon
Steps:
1. Wait past hold_expires_at.
2. Call mutation /mark-ready.
Expected: 422. Reservation moves to expired.

## TC-06 Illegal Status Transition

Precondition: Reservation state = served
Steps:
1. Call /mark-ready on same reservation.
Expected: 422. Terminal states cannot transition out.

## TC-07 Partial Document Approval

Precondition: Pharmacy has 3 approved, 1 rejected document
Steps:
1. Admin approves or rejects one document.
2. Resubmit rejected document.
Expected: Pharmacy stays non-approvable until all 4 approved.

## TC-08 TVA Computation Server-Side

Precondition: Response with unit_price=1000, quantity=2, tva_rate=18
Steps:
1. Inspect response from /responses/:id and /requests/:id.
Expected: tva_amount = 360.00, total = 2360.00. Client never computes this.

## TC-09 Payment Webhook Replay

Precondition: Payment succeeded event webhook sent once
Steps:
1. Replay same webhook payload with same provider_transaction_id.
Expected: Existing transaction returned. No duplicate charge.

## TC-10 Account Deletion Cascade

Precondition: User with requests, reservations, push tokens
Steps:
1. Soft-delete user via admin flow.
Expected: User anonymized; requests/reservations retained under audit rules; active pushes disabled.

## TC-11 Waiting-List 24h Window

Precondition: Waiting list entry state = ready, ready_at = now - 25h
Steps:
1. Run waiting-list sweep job manually or wait.
2. Inspect waiting list state.
Expected: state = expired. Next patient notified.

## TC-12 Multi-Branch Staff Scoping

Precondition: Organization with 2 pharmacies; staff assigned to Pharmacy A only
Steps:
1. Fetch Pharmacy B dashboard via staff API token.
Expected: 403 or empty result. Staff cannot see cross-pharmacy data.
