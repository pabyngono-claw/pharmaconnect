# Seed — Users: Pharmacy Staff and Patients
# Staff users are placeholder accounts; link by Xano auth if available or store password_hash via dummy value.
# Deterministic IDs.

-- Staff users
INSERT INTO users (id, phone, email, role, is_verified, metadata)
VALUES
  ('20000000-0000-0000-0000-000000000001', '+221****1001', 'owner.demo@example.com', 'pharmacy', true, '{"first_name":"Aminata","last_name":"Diop"}'),
  ('20000000-0000-0000-0000-000000000002', '+221****1002', 'owner.backend@example.com', 'pharmacy', true, '{"first_name":"Ousmane","last_name":"Ndiaye"}'),
  ('20000000-0000-0000-0000-000000000003', '+221****1003', 'manager.demo@example.com', 'pharmacy', true, '{"first_name":"Fatou","last_name":"Sow"}')
ON CONFLICT (phone) DO NOTHING;

-- Pharmacy staff link table
INSERT INTO pharmacy_staff (pharmacy_id, user_id, role)
VALUES
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'owner'),
  ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'owner'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'manager');

-- Patient users
INSERT INTO users (id, phone, email, role, is_verified, metadata)
VALUES
  ('30000000-0000-0000-0000-000000000001', '+221****2001', 'patient.one@example.com', 'patient', true, '{"first_name":"Ibrahima","last_name":"Fall"}'),
  ('30000000-0000-0000-0000-000000000002', '+221****2002', 'patient.two@example.com', 'patient', true, '{"first_name":"Mariama","last_name":"Ba"}'),
  ('30000000-0000-0000-0000-000000000003', '+221****2003', 'patient.three@example.com', 'patient', true, '{"first_name":"Abdou","last_name":"Diallo"}')
ON CONFLICT (phone) DO NOTHING;
