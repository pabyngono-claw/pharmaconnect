-- INDEXES --------------------------------------------------------------

CREATE INDEX users_phone_idx ON users(phone);
CREATE INDEX users_email_idx ON users(email);

CREATE INDEX otp_phone_purpose_idx ON otp_verifications(phone, purpose, created_at);
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens(user_id, revoked_at);
CREATE INDEX push_tokens_user_idx ON push_tokens(user_id, pruned_at);

CREATE INDEX organizations_registration_idx ON organizations(registration_number);

CREATE INDEX pharmacies_location_idx ON pharmacies(lat, lng);
CREATE INDEX pharmacies_status_idx ON pharmacies(approval_status);
CREATE INDEX pharmacy_staff_pharmacy_user_idx ON pharmacy_staff(pharmacy_id, user_id);
CREATE INDEX pharmacy_documents_pharmacy_idx ON pharmacy_documents(pharmacy_id);
CREATE INDEX pharmacy_hours_pharmacy_day_idx ON pharmacy_hours(pharmacy_id, day_of_week);
CREATE INDEX garde_dates_pharmacy_idx ON garde_dates(pharmacy_id, start_at, end_at);

CREATE INDEX requests_patient_idx ON requests(patient_id, created_at);
CREATE INDEX requests_expires_status_idx ON requests(expires_at, status);
CREATE INDEX request_images_request_idx ON request_images(request_id);
CREATE INDEX request_pharmacies_request_pharmacy_idx ON request_pharmacies(request_id, pharmacy_id);
CREATE INDEX responses_request_status_idx ON responses(request_id, status);

CREATE INDEX reservations_state_hold_idx ON reservations(state, hold_expires_at);
CREATE INDEX waiting_lists_pharmacy_state_ready_idx ON waiting_lists(pharmacy_id, state, ready_at);

CREATE INDEX notifications_user_read_idx ON notifications(user_id, read_at);
CREATE INDEX support_tickets_status_idx ON support_tickets(status, tier);
CREATE INDEX subscriptions_status_idx ON subscriptions(status, current_period_end);
CREATE INDEX payment_transactions_provider_txn_idx ON payment_transactions(provider_transaction_id);
CREATE INDEX audit_logs_entity_idx ON audit_logs(entity_type, entity_id, created_at);
