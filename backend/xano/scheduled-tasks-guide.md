# Xano Scheduled Tasks — PharmaConnect v2.0

Implement as Xano Scheduler or as authenticated internal API endpoints invoked by an external cron. Prefer Xano-native scheduler.

## Jobs

### expire-requests
- Frequency: every 15 minutes
- Action: select requests where expires_at <= now and status = submitted; set status = expired; create system notification for patient with "request_expired" type; if no reservation exists, set re_broadcast_suggested = true on request metadata.

### expire-reservations
- Frequency: every 5 minutes
- Action: select reservations in submitted or ready where hold_expires_at <= now; if state=ready transition to expired; notify patient with reservation_expired; notify pharmacy waiting list if entry exists.

### expire-waiting-lists
- Frequency: every 15 minutes
- Action: select waiting_lists where state=ready and expires_at <= now; set state=expired; promote next queue_position for same pharmacy if any.

### renew-subscriptions
- Frequency: daily at 09:00 UTC
- Action: select subscriptions where status=trial and trial_ends_at <= now -> past_due; select status=active and current_period_end <= now -> expired; create notification.

### prune-push-tokens
- Frequency: weekly Sunday 04:00 UTC
- Action: select push_tokens where last_used_at <= now - 60 days; set pruned_at = now.

## Error Handling
- Wrap job in try/catch; log to audit_logs with action = "scheduler:<job>" and success/failure.
- Alert admin if any job fails 3 consecutive runs.
