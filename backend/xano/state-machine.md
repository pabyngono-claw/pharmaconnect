# Reservation State Machine — Xano Enforcement

Table: reservations.state

## Allowed Transitions

- SUBMITTED -> ready
- SUBMITTED -> rejected
- SUBMITTED -> expired (sweep only)
- SUBMITTED -> cancelled
- READY -> served
- READY -> rejected

## Terminal States

- served
- rejected
- expired
- cancelled

No transitions out of terminal states.

## Error Behavior

Any disallowed transition returns:
HTTP 422
Body:
{
  "error": {
    "code": "ILLEGAL_STATE_TRANSITION",
    "message": "Transition from {from} to {to} is not allowed",
    "field_errors": null
  }
}

## Hold Expiry

- READY moves to expired only via scheduled task (5 min sweep)
- SUBMITTED hold_expires_at additionally expires via scheduled task

## Mutations Require Idempotency-Key

POST /reservations
POST /reservations/:id/mark-ready
POST /reservations/:id/mark-served
POST /reservations/:id/cancel
