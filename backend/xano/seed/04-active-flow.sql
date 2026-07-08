# Seed — Active delivery flow
# Requests -> images -> pharmacy broadcast -> responses -> reservation -> waiting list -> notification

INSERT INTO requests (id, patient_id, prescription_images_count, product_type, notes, quantity, expires_at, status)
VALUES
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1, 'product', 'Besoin urgent de Doliprane 1000mg', 2, now() + interval '72 hours', 'submitted'),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 2, 'prescription', 'Ordonnance renouvellement', NULL, now() + interval '48 hours', 'submitted')
ON CONFLICT (id) DO NOTHING;

-- Images
INSERT INTO request_images (id, request_id, url, sort)
VALUES
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'https://example.com/images/r1-img1.jpg', 0),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', 'https://example.com/images/r2-img1.jpg', 0),
  ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000002', 'https://example.com/images/r2-img2.jpg', 1)
ON CONFLICT (id) DO NOTHING;

-- Pharmacy broadcast for request 001
INSERT INTO request_pharmacies (request_id, pharmacy_id, status)
VALUES
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'sent'),
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'sent')
ON CONFLICT DO NOTHING;

-- Responses
INSERT INTO responses (id, request_id, pharmacy_id, unit_price, quantity, tva_rate, tva_amount, total, status)
VALUES
  ('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1500.00, 2, 18.00, 540.00, 3540.00, 'available', now() + interval '24 hours'),
  ('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 1700.00, 2, 18.00, 612.00, 3812.00, 'available', now() + interval '24 hours')
ON CONFLICT (id) DO NOTHING;

-- Reservation from response 1
INSERT INTO reservations (id, request_id, response_id, pharmacy_id, patient_id, state, hold_expires_at)
VALUES
  ('80000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'ready', now() + interval '4 hours')
ON CONFLICT (id) DO NOTHING;

-- Notification for reservation
INSERT INTO notifications (user_id, type, title, body, deep_link)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'reservation', 'Reservation confirmee', 'Votre pharmacie confirme la disponibilite.', '/reservations/80000000-0000-0000-0000-000000000001');
