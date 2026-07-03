# Xano Scheduled Tasks

Run from Xano Scheduler.

## Request Expiry Sweep
- Frequency: every 15 minutes
- Action: set requests.status = expired where expires_at < now() and status in (submitted, viewed)
- Side effect: notify pharmacy of re-broadcast suggestion

## Reservation Hold Sweep
- Frequency: every 5 minutes
- Action: set reservations.state = expired where hold_expires_at < now() and state in (submitted, ready)
- Side effect: release response hold

## Waiting-List Window Sweep
- Frequency: every 15 minutes
- Action: set waiting_lists.state = expired where expires_at < now() and state = ready
- Side effect: notify next patient in queue

## Subscription Renewal Check
- Frequency: daily
- Action: set subscriptions.status = expired where current_period_end < now()
- Side effect: disable premium features

## Push Token Pruning
- Frequency: weekly
- Action: set push_tokens.pruned_at = now() where last_used_at < now() - 60 days and pruned_at is null
- Side effect: reduce payload size and fake-token noise
