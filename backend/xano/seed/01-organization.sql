INSERT INTO organizations (id, name, country_code, region, created_at)
VALUES
  ('2da51c9b-c0ba-54ba-bbd2-05637eab7b15', 'Pharma Group A', 'SN', 'Dakar', '2025-01-01T00:00:00Z'),
  ('ef54d76d-6c39-5b37-8078-47aa7c00930d', 'Pharma Group B', 'SN', 'Thies', '2025-01-01T00:00:00Z');

INSERT INTO pharmacies (id, organization_id, name, lat, lng, active, created_at)
VALUES
  ('9f0f5e4e-000d-5a5d-a035-66439d1f9fb8', '2da51c9b-c0ba-54ba-bbd2-05637eab7b15', 'Pharmacie Test A', 14.7167, -17.4677, true, '2025-01-01T00:00:00Z'),
  ('dd428c4c-5312-57c9-895c-87d2ffd2c8eb', 'ef54d76d-6c39-5b37-8078-47aa7c00930d', 'Pharmacie Test B', 14.79, -17.38, true, '2025-01-01T00:00:00Z');
