INSERT INTO requests (id, patient_id, product_type, notes, quantity, status, created_at)
VALUES
  ('e21b2eeb-0391-53bf-bedd-9daf6dda12b4', 'f2d85b6c-013f-5335-936f-39155bc13eed', 'product', 'Doliprane 1000mg x2', 2, 'submitted', now());

INSERT INTO reservations (id, request_id, pharmacy_id, status, created_at)
VALUES
  ('9192f1e2-7c53-5e5d-9f2b-9bbfd5858016', 'e21b2eeb-0391-53bf-bedd-9daf6dda12b4', '9f0f5e4e-000d-5a5d-a035-66439d1f9fb8', 'reserved', now());
