-- PharmaConnect v2.0 — Xano schema seed
-- Order: enums first, then tables by dependency level, then indexes, then triggers.

-- ENUMS ---------------------------------------------------------------

CREATE TYPE role_enum AS ENUM ('patient','pharmacy','admin','super_admin');
CREATE TYPE purpose_enum AS ENUM ('login','reset','link');
CREATE TYPE platform_enum AS ENUM ('ios','android','web');

CREATE TYPE approval_status_enum AS ENUM ('pending','approved','rejected','suspended');
CREATE TYPE document_type_enum AS ENUM ('business_registration','pharmacy_license','pharmacist_diploma','owner_id');
CREATE TYPE role_staff_enum AS ENUM ('owner','manager','staff');
CREATE TYPE document_status_enum AS ENUM ('pending','approved','rejected');

CREATE TYPE product_type_enum AS ENUM ('prescription','product','equipment');
CREATE TYPE request_status_enum AS ENUM ('submitted','expired','reserved','served','cancelled');
CREATE TYPE request_pharmacy_status_enum AS ENUM ('sent','viewed','responded');

CREATE TYPE response_status_enum AS ENUM ('available','reserved','rejected','expired');

CREATE TYPE reservation_state_enum AS ENUM ('submitted','ready','served','rejected','expired','cancelled');
CREATE TYPE waiting_state_enum AS ENUM ('ready','expired','served','cancelled');

CREATE TYPE notification_type_enum AS ENUM ('request','response','reservation','waiting','payment','subscription');

CREATE TYPE ticket_tier_enum AS ENUM ('tier1','tier2','tier3');
CREATE TYPE ticket_status_enum AS ENUM ('open','in_progress','resolved','closed');

CREATE TYPE subscription_status_enum AS ENUM ('trial','active','past_due','expired','cancelled');

CREATE TYPE payment_status_enum AS ENUM ('pending','authorized','succeeded','failed','refunded');
CREATE TYPE provider_enum AS ENUM ('orange_money','wave');

-- TABLES ---------------------------------------------------------------

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  email text UNIQUE,
  password_hash text,
  role role_enum NOT NULL DEFAULT 'patient',
  is_verified boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  phone text NOT NULL,
  code_hash text NOT NULL,
  purpose purpose_enum NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  locked_until timestamp,
  expires_at timestamp NOT NULL,
  consumed_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  token_hash text NOT NULL,
  expires_at timestamp NOT NULL,
  rotated_at timestamp NOT NULL,
  revoked_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  token text NOT NULL,
  platform platform_enum NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamp,
  pruned_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  registration_number text NOT NULL UNIQUE,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  address text NOT NULL,
  quartier text NOT NULL,
  lat decimal(10,8) NOT NULL,
  lng decimal(11,8) NOT NULL,
  phone text NOT NULL UNIQUE,
  approval_status approval_status_enum NOT NULL DEFAULT 'pending',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE pharmacy_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role role_staff_enum NOT NULL DEFAULT 'staff',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE pharmacy_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id),
  document_type document_type_enum NOT NULL,
  file_url text NOT NULL,
  status document_status_enum NOT NULL DEFAULT 'pending',
  review_note text,
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE pharmacy_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id),
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time time NOT NULL,
  close_time time NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE garde_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id),
  staff_user_id uuid NOT NULL REFERENCES users(id),
  start_at timestamp NOT NULL,
  end_at timestamp NOT NULL,
  overlap_token text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES users(id),
  prescription_images_count integer NOT NULL DEFAULT 0,
  product_type product_type_enum NOT NULL,
  notes text,
  quantity integer,
  expires_at timestamp NOT NULL,
  re_broadcast_suggested boolean NOT NULL DEFAULT false,
  status request_status_enum NOT NULL DEFAULT 'submitted',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE request_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES requests(id),
  url text NOT NULL,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE request_pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES requests(id),
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id),
  status request_pharmacy_status_enum NOT NULL DEFAULT 'sent',
  sent_at timestamp NOT NULL DEFAULT now(),
  viewed_at timestamp,
  responded_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES requests(id),
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id),
  unit_price decimal(10,2) NOT NULL,
  quantity integer NOT NULL,
  tva_rate decimal(5,2) NOT NULL,
  tva_amount decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  status response_status_enum NOT NULL DEFAULT 'available',
  hold_expires_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES requests(id),
  response_id uuid NOT NULL REFERENCES responses(id),
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id),
  patient_id uuid NOT NULL REFERENCES users(id),
  state reservation_state_enum NOT NULL DEFAULT 'submitted',
  hold_expires_at timestamp,
  served_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE waiting_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id),
  reservation_id uuid REFERENCES reservations(id),
  queue_position integer NOT NULL,
  state waiting_state_enum NOT NULL DEFAULT 'ready',
  ready_at timestamp NOT NULL,
  expires_at timestamp NOT NULL,
  notified_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  type notification_type_enum NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  deep_link text,
  read_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  tier ticket_tier_enum NOT NULL DEFAULT 'tier1',
  subject text NOT NULL,
  body text NOT NULL,
  status ticket_status_enum NOT NULL DEFAULT 'open',
  assigned_to uuid REFERENCES users(id),
  resolved_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  pharmacy_id uuid REFERENCES pharmacies(id),
  plan_id uuid NOT NULL,
  status subscription_status_enum NOT NULL DEFAULT 'trial',
  trial_ends_at timestamp,
  current_period_start timestamp,
  current_period_end timestamp,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id),
  user_id uuid REFERENCES users(id),
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'XOF',
  provider provider_enum NOT NULL,
  provider_transaction_id text NOT NULL UNIQUE,
  status payment_status_enum NOT NULL DEFAULT 'pending',
  raw_payload jsonb,
  created_at timestamp NOT NULL DEFAULT now()
);

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

-- TRIGGERS -------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON pharmacies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
