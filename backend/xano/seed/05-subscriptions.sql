# Seed — Document status by pharmacy
# Pharmacy 001 has all 4 approved; 003 has none approved.

-- Ensure approval_status consistent with documents
UPDATE pharmacies SET approval_status = 'approved' WHERE id = '10000000-0000-0000-0000-000000000001';
UPDATE pharmacies SET approval_status = 'pending' WHERE id = '10000000-0000-0000-0000-000000000003';

-- Seed subscription for demo pharmacy
INSERT INTO subscriptions (id, user_id, pharmacy_id, plan_id, status, trial_ends_at, current_period_start, current_period_end)
VALUES
  ('90000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'plan-demo-001', 'active', now() + interval '30 days', now(), now() + interval '30 days')
ON CONFLICT (id) DO NOTHING;

-- Push token for patient
INSERT INTO push_tokens (id, user_id, token, platform, is_active)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'demo-fcm-token-001', 'ios', true)
ON CONFLICT (id) DO NOTHING;
