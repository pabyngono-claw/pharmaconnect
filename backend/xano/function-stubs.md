# Xano Function Stubs — PharmaConnect v2.0

Use these as starting points for internal Xano functions.

## auth.request-otp
Input: phone
Logic:
- normalize phone E.164.
- count otp_verifications where phone = input.phone and created_at > now - 10m; if >= 3 return error 429 with cooldown.
- generate 6-digit code; store code_hash = bcrypt(code); expires_at = now + 5m; attempts = 0.
- send via provider; return masked_phone.

## auth.verify-otp
Input: phone, code, purpose
Logic:
- fetch latest otp_verification for phone where purpose = input.purpose and consumed_at is null and locked_until is null and expires_at > now.
- if not found or attempts >= 5 return 401.
- if bcrypt compare fails: attempts += 1; if attempts >= 5 set locked_until = now + 10m; return 401.
- else set consumed_at = now; create or fetch user; issue access + refresh tokens; return tokens.

## auth.refresh
Input: refresh_token
Logic:
- rotate refresh token; revoke previous; return new access + refresh.

## requests.create
Input: product_type, notes?, quantity?, images[]?, metadata?
Logic:
- validate input; if authenticated attach patient_id from access token else create guest session flag.
- compute expires_at = now + 72h.
- insert request; insert request_images; create system notification.
- fan-out insert request_pharmacies entries for nearest N pharmacies using lat/lng sort.

## requests.link
Input: request_id, access_token
Logic:
- find pending request by id with no patient_id; attach patient_id from token; return request_id.

## responses.create
Input: request_id, unit_price, quantity
Logic:
- verify pharmacy staff; ensure request expires_at > now; compute tva_rate from pharmacy config or default 18%; compute tva_amount = unit_price * quantity * tva_rate / 100; compute total = unit_price * quantity + tva_amount.
- insert response; update request_pharmacies status -> responded; notify patient.

## reservations.create
Input: request_id, response_id, idempotency_key
Logic:
- verify idempotency_key; if seen return existing reservation.
- verify response.status = available; set response.status = reserved; set hold_expires_at = now + 15m; set state = submitted; insert reservation; update request_pharmacies status; notify pharmacy and patient.

## pharmacies.mark-ready
Input: reservation_id
Logic:
- verify pharmacy owns reservation; if state != submitted return 422; set state=ready; set hold_expires_at = now + 24h; create waiting_list entry with queue_position = max+1 for pharmacy; notify patient reservation ready.

## pharmacies.mark-served
Input: reservation_id
Logic:
- verify pharmacy owns reservation; if state != ready return 422; set state=served; set served_at=now; complete waiting list entry; notify patient served.

## webhooks.payments
Input: provider_transaction_id, status, amount?, raw?
Logic:
- upsert payment_transaction by provider_transaction_id; map provider status to internal status.
