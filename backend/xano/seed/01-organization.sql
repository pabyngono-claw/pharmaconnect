# Seed — Organizations, Pharmacies, and Staff
# Run in Xano Database > Query or via backend import as SQL.
# All UUIDs are deterministic for demo/test environments.

-- Organizations
INSERT INTO organizations (id, name, registration_number)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Pharmacie Demo SA', 'REG-DEMO-001'),
  ('00000000-0000-0000-0000-000000000002', 'Pharmacie Backend SARL', 'REG-BACKEND-002')
ON CONFLICT (registration_number) DO NOTHING;

-- Pharmacies
INSERT INTO pharmacies (id, organization_id, name, address, quartier, lat, lng, phone, approval_status, is_active)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Pharmacie Demo Plateau', 'Avenue Bourguiba, Dakar', 'Plateau', 14.71670000, -17.46770000, '+221781234567', 'approved', true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Pharmacie Backend Point E', 'Rue de Point E, Dakar', 'Point E', 14.72050000, -17.45230000, '+221789876543', 'pending', false),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Pharmacie Demo Almadies', 'Route des Almadies, Dakar', 'Almadies', 14.73580000, -17.49560000, '+221770000111', 'approved', true)
ON CONFLICT (phone) DO NOTHING;

-- Pharmacy hours (Mon-Fri 8-20, Sat 9-14, Sun closed)
INSERT INTO pharmacy_hours (pharmacy_id, day_of_week, open_time, close_time)
SELECT '10000000-0000-0000-0000-000000000001', d, CASE WHEN d = 6 THEN '09:00'::time ELSE '08:00'::time END, CASE WHEN d = 6 THEN '14:00'::time ELSE '20:00'::time END
FROM generate_series(0,6) AS d
WHERE d <> 0;

INSERT INTO pharmacy_hours (pharmacy_id, day_of_week, open_time, close_time)
SELECT '10000000-0000-0000-0000-000000000003', d, CASE WHEN d = 6 THEN '09:00'::time ELSE '08:00'::time END, CASE WHEN d = 6 THEN '14:00'::time ELSE '20:00'::time END
FROM generate_series(0,6) AS d
WHERE d <> 0;

-- Garde/on-call dates: pharmacy 001 open now->+8h, pharmacy 003 open +2h->+10h
INSERT INTO garde_dates (pharmacy_id, staff_user_id, start_at, end_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', now(), now() + interval '8 hours'),
  ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', now() + interval '2 hours', now() + interval '10 hours');
