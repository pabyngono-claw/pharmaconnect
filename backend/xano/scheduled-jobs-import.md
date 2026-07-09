# Xano Scheduled Jobs — Copy/Paste Config

Use this when creating jobs in Xano Scheduler UI.
Create each job exactly as specified, then verify via logs after first run.

## Job : expire-requests
- Name: `expire-requests`
- Frequency: every 15 minutes
- Endpoint: `/jobs/expire-requests`
- Auth: internal or admin API key
- SQL:
```sql
UPDATE requests
SET status = 'expired', updated_at = now(), re_broadcast_suggested = true
WHERE status = 'submitted'
  AND expires_at <= now();
```
- Audit action: `scheduler:expire-requests`

## Job : expire-reservations
- Name: `expire-reservations`
- Frequency: every 5 minutes
- Endpoint: `/jobs/expire-reservations`
- Auth: internal or admin API key
- SQL:
```sql
UPDATE reservations
SET state = 'expired', updated_at = now()
WHERE state IN ('submitted', 'ready')
  AND hold_expires_at <= now();
```
- Audit action: `scheduler:expire-reservations`

## Job : expire-waiting-lists
- Name: `expire-waiting-lists`
- Frequency: every 15 minutes
- Endpoint: `/jobs/expire-waiting-lists`
- Auth: internal or admin API key
- SQL:
```sql
UPDATE waiting_lists
SET state = 'expired'
WHERE state = 'ready'
  AND expires_at <= now();
```
- Audit action: `scheduler:expire-waiting-lists`

## Job : renew-subscriptions
- Name: `renew-subscriptions`
- Frequency: daily at 09:00 UTC
- Endpoint: `/jobs/renew-subscriptions`
- Auth: internal or admin API key
- SQL:
```sql
UPDATE subscriptions
SET status = CASE
  WHEN status = 'trial' AND trial_ends_at <= now() THEN 'past_due'
  WHEN status = 'active' AND current_period_end <= now() THEN 'expired'
  ELSE status
END
WHERE (status = 'trial' AND trial_ends_at <= now())
   OR (status = 'active' AND current_period_end <= now());
```
- Audit action: `scheduler:renew-subscriptions`

## Job : prune-push-tokens
- Name: `prune-push-tokens`
- Frequency: weekly on Sunday at 04:00 UTC
- Endpoint: `/jobs/prune-push-tokens`
- Auth: internal or admin API key
- SQL:
```sql
UPDATE push_tokens
SET is_active = false, pruned_at = now()
WHERE is_active = true
  AND last_used_at <= now() - interval '60 days';
```
- Audit action: `scheduler:prune-push-tokens`
