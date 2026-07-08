# Xano Scheduled Jobs Execution Guide — PharmaConnect v2.0

Execute this setup inside Xano after deploying schema and API groups. Each job is defined with exact inputs, query, action, and success criteria.

## Prerequisites
- `pharmaconnect` database deployed
- API Groups: auth, requests, reservations, pharmacies, admin, webhooks, jobs deployed
- Admin user exists with role `admin` or `super_admin`
- Internal auth header or elevated access token for manual endpoint invocation

---

## Job: expire-requests
Frequency: every 15 minutes

Execution query:
```sql
SELECT id FROM requests
WHERE expires_at <= now()
  AND status = 'submitted'
```

For each row:
1. Update status = 'expired', updated_at = now.
2. Set re_broadcast_suggested = true in metadata if no reservation exists.
3. Insert notification:
   - user_id = patient_id
   - type = 'request'
   - title = 'Demande expiree'
   - body = 'Votre demande a expire. Vous pouvez en creer une nouvelle.'
   - deep_link = '/requests/new'
4. Insert audit_log with action = 'scheduler:expire-requests' and success = true.

Retry policy: wrap in try/catch; on failure log audit_logs with success = false and continue.

Alert rule: if consecutive failures >= 3, notify admin via notification.

---

## Job: expire-reservations
Frequency: every 5 minutes

Execution query:
```sql
SELECT id, state, hold_expires_at FROM reservations
WHERE state IN ('submitted', 'ready')
  AND hold_expires_at <= now()
```

For each row:
1. If state = 'ready' => state = 'expired'.
2. Update reservation.state = 'expired' if applicable.
3. Insert notification for patient with type = 'reservation', title = 'Reservation expiree', deep_link = '/reservations/:id'.
4. If waiting list exists for reservation_id, update waiting_lists.state = 'expired'.
5. Insert audit_log with action = 'scheduler:expire-reservations' and success = true.

---

## Job: expire-waiting-lists
Frequency: every 15 minutes

Execution query:
```sql
SELECT id, pharmacy_id, queue_position, state, expires_at
FROM waiting_lists
WHERE state = 'ready'
  AND expires_at <= now()
```

For each row:
1. Update state = 'expired'.
2. If there are other waiting_lists rows for same pharmacy with state = 'ready', promote the one with smallest queue_position or earliest ready_at by renumbering queue_position if needed.
3. Insert notification for pharmacy with type = 'waiting', title = 'Cree disponible', body = 'Le patient a manque son creneau.', deep_link = '/pharmacy/waiting-list'.
4. Insert audit_log with action = 'scheduler:expire-waiting-lists' and success = true.

---

## Job: renew-subscriptions
Frequency: daily at 09:00 UTC

Execution queries:
```sql
SELECT id, user_id, pharmacy_id
FROM subscriptions
WHERE status = 'trial'
  AND trial_ends_at <= now();
```
Update these to status = 'past_due'.

```sql
SELECT id, user_id, pharmacy_id
FROM subscriptions
WHERE status = 'active'
  AND current_period_end <= now();
```
Update these to status = 'expired'.

For each updated row:
1. Insert notification for user_id or pharmacy owner with type = 'subscription', title = 'Abonnement mis a jour', deep_link = '/subscription' or '/pharmacy/profile'.
2. Insert audit_log with action = 'scheduler:renew-subscriptions' and success = true.

---

## Job: prune-push-tokens
Frequency: weekly Sunday 04:00 UTC

Execution query:
```sql
SELECT id FROM push_tokens
WHERE is_active = true
  AND last_used_at <= now() - interval '60 days';
```

For each row:
1. Update is_active = false, pruned_at = now.
2. Insert audit_log with action = 'scheduler:prune-push-tokens' and success = true.

---

## Implementation Notes
- In Xano Scheduler UI, create 5 jobs with exact frequencies above.
- For each job, set the internal endpoint to `/jobs/<job-name>` and protect with admin/internal API key.
- If using a shared admin API key instead of internal auth, validate header in each jobs function.
- Wrap mutations with limit = 500 per run to avoid long-running executions; repeat next cycle if more rows remain.

## Backfill
For immediate historical cleanup:
1. Call `/jobs/expire-requests`
2. Call `/jobs/expire-reservations`
3. Call `/jobs/expire-waiting-lists`
4. Call `/jobs/prune-push-tokens`
Review audit_logs after each backfill run before continuing.
