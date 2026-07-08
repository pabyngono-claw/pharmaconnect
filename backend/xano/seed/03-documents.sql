# Seed — Pharmacy approval files
# Uses deterministic IDs; for demo only.

-- Pharmacy documents for pharmacy 001 (approved) and 003 (pending)
INSERT INTO pharmacy_documents (id, pharmacy_id, document_type, file_url, status, review_note, reviewed_by)
VALUES
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'business_registration', 'https://example.com/docs/bus-reg-001.pdf', 'approved', 'OK', '20000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'pharmacy_license', 'https://example.com/docs/license-001.pdf', 'approved', 'OK', '20000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'pharmacist_diploma', 'https://example.com/docs/diploma-001.pdf', 'approved', 'OK', '20000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'owner_id', 'https://example.com/docs/id-001.pdf', 'approved', 'OK', '20000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'business_registration', 'https://example.com/docs/bus-reg-003.pdf', 'pending', null, null),
  ('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'pharmacy_license', 'https://example.com/docs/license-003.pdf', 'pending', null, null),
  ('40000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'pharmacist_diploma', 'https://example.com/docs/diploma-003.pdf', 'pending', null, null),
  ('40000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'owner_id', 'https://example.com/docs/id-003.pdf', 'pending', null, null)
ON CONFLICT (id) DO NOTHING;
