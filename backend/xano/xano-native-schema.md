# Xano Native Schema — PharmaConnect v2.0

Build these tables in Xano Database UI. No PostgreSQL SQL needed.
Field format: `name: type | required | unique | default | notes`

---

## users

- id: uuid | required | auto-generated | primary key
- phone: text | required | unique | | E.164 format
- email: text | unique | | | optional
- password_hash: text | | | | optional for OTP-only users
- role: text | required | | patient | enum: patient / pharmacy / admin / super_admin
- is_verified: boolean | required | | false
- metadata: json | required | | {} | optional profile data
- created_at: datetime | required | | now()
- updated_at: datetime | required | | now()

Relations:
- has_many: otp_verifications
- has_many: refresh_tokens
- has_many: push_tokens
- has_many: pharmacy_staff
- has_many: requests (as patient_id)
- has_many: notifications
- has_many: support_tickets
- has_many: subscriptions
- has_many: pharmacy_document
- has_many: payment
- has_many: audit_logs (as actor_user_id)

---

## organizations

- id: uuid | required | auto-generated | primary key
- name: text | required | |
- registration_number: text | required | unique |
- created_at: datetime | required | | now()

Relations:
- has_many: pharmacies

---

## pharmacies

- id: uuid | required | auto-generated | primary key
- organization_id: uuid | required | relation: organizations.id
- name: text | required | |
- address: text | required | |
- quartier: text | required | |
- lat: number | required | | | decimal(10,8)
- lng: number | required | | | decimal(11,8)
- phone: text | required | unique |
- approval_status: text | required | | pending | enum: pending / approved / rejected / suspended
- is_active: boolean | required | | false
- created_at: datetime | required | | now()
- updated_at: datetime | required | | now()

Relations:
- has_many: pharmacy_staff
- has_many: pharmacy_document
- has_many: pharmacy_hours
- has_many: garde_dates
- has_many: pharmacy_inventory
- has_many: medicine_catalog (pharmacy-specific catalog entries)
- has_many: reservations
- has_many: waitlists
- has_many: requests (via request_pharmacies)
- has_many: responses
- has_many: subscriptions

---

## pharmacy_staff

- id: uuid | required | auto-generated | primary key
- pharmacy_id: uuid | required | relation: pharmacies.id
- user_id: uuid | required | relation: users.id
- role: text | required | | staff | enum: owner / manager / staff
- is_active: boolean | required | | true
- created_at: datetime | required | | now()

Unique: pharmacy_id + user_id

---

## pharmacy_document

- id: uuid | required | auto-generated | primary key
- pharmacy_id: uuid | required | relation: pharmacies.id
- document_type: text | required | | | enum: business_registration / pharmacy_license / pharmacist_diploma / owner_id
- file_url: text | required | |
- status: text | required | | pending | enum: pending / approved / rejected
- review_note: text | | | |
- reviewed_by: uuid | | relation: users.id |
- reviewed_at: datetime | | | |
- created_at: datetime | required | | now()

---

## pharmacy_hours

- id: uuid | required | auto-generated | primary key
- pharmacy_id: uuid | required | relation: pharmacies.id
- day_of_week: number | required | | | 0-6 (Mon-Sun)
- open_time: time | required | |
- close_time: time | required | |
- created_at: datetime | required | | now()

Unique: pharmacy_id + day_of_week

---

## garde_dates

- id: uuid | required | auto-generated | primary key
- pharmacy_id: uuid | required | relation: pharmacies.id
- staff_user_id: uuid | required | relation: users.id
- start_at: datetime | required | |
- end_at: datetime | required | |
- overlap_token: text | | | | optional concurrency guard
- created_at: datetime | required | | now()

---

## medicine_catalog

- id: uuid | required | auto-generated | primary key
- pharmacy_id: uuid | required | relation: pharmacies.id
- name: text | required | |
- dosage: text | | | |
- form: text | | | | enum: tablet / capsule / syrup / injection / cream / other
- unit: text | required | | | e.g. box, bottle
- stock_quantity: number | required | | 0
- reorder_point: number | required | | 0
- created_at: datetime | required | | now()
- updated_at: datetime | required | | now()

Unique: pharmacy_id + name + dosage + form

---

## pharmacy_inventory

- id: uuid | required | auto-generated | primary key
- pharmacy_id: uuid | required | relation: pharmacies.id
- medicine_catalog_id: uuid | required | relation: medicine_catalog.id
- batch_number: text | required | |
- expiry_date: date | required | |
- quantity: number | required | | 0
- cost_price: number | | | |
- selling_price: number | | | |
- created_at: datetime | required | | now()
- updated_at: datetime | required | | now()

---

## inventory_update

- id: uuid | required | auto-generated | primary key
- pharmacy_inventory_id: uuid | required | relation: pharmacy_inventory.id
- change_type: text | required | | | enum: restock / sale / adjustment / return
- quantity_delta: number | required | |
- note: text | | | |
- actor_user_id: uuid | | relation: users.id |
- created_at: datetime | required | | now()

---

## medicine_request

- id: uuid | required | auto-generated | primary key
- patient_id: uuid | required | relation: users.id
- prescription_images_count: number | required | | 0
- product_type: text | required | | prescription | enum: prescription / product / equipment
- notes: text | | | |
- quantity: number | | | |
- expires_at: datetime | required | |
- re_broadcast_suggested: boolean | required | | false
- status: text | required | | submitted | enum: submitted / expired / reserved / served / cancelled
- created_at: datetime | required | | now()
- updated_at: datetime | required | | now()

Relations:
- has_many: request_item
- has_many: request_pharmacies
- has_many: pharmacy_responses
- has_many: reservations

---

## request_item

- id: uuid | required | auto-generated | primary key
- medicine_request_id: uuid | required | relation: medicine_request.id
- url: text | required | |
- sort: number | required | | 0
- created_at: datetime | required | | now()

---

## request_pharmacies

- id: uuid | required | auto-generated | primary key
- medicine_request_id: uuid | required | relation: medicine_request.id
- pharmacy_id: uuid | required | relation: pharmacies.id
- status: text | required | | sent | enum: sent / viewed / responded
- sent_at: datetime | required | | now()
- viewed_at: datetime | | | |
- responded_at: datetime | | | |
- created_at: datetime | required | | now()

Unique: medicine_request_id + pharmacy_id

---

## pharmacy_response

- id: uuid | required | auto-generated | primary key
- medicine_request_id: uuid | required | relation: medicine_request.id
- pharmacy_id: uuid | required | relation: pharmacies.id
- unit_price: number | required | | | decimal(10,2)
- quantity: number | required | |
- tva_rate: number | required | | | decimal(5,2)
- tva_amount: number | required | | | decimal(10,2)
- total: number | required | | | decimal(10,2)
- status: text | required | | available | enum: available / reserved / rejected / expired
- hold_expires_at: datetime | | | |
- created_at: datetime | required | | now()

Unique: medicine_request_id + pharmacy_id

---

## reservation

- id: uuid | required | auto-generated | primary key
- medicine_request_id: uuid | required | relation: medicine_request.id
- response_id: uuid | required | relation: pharmacy_response.id
- pharmacy_id: uuid | required | relation: pharmacies.id
- patient_id: uuid | required | relation: users.id
- status: text | required | | submitted | enum: submitted / ready / served / rejected / expired / cancelled
- hold_expires_at: datetime | | | |
- served_at: datetime | | | |
- created_at: datetime | required | | now()
- updated_at: datetime | required | | now()

---

## waitlist

- id: uuid | required | auto-generated | primary key
- pharmacy_id: uuid | required | relation: pharmacies.id
- reservation_id: uuid | | relation: reservation.id |
- queue_position: number | required | |
- status: text | required | | ready | enum: ready / expired / served / cancelled
- ready_at: datetime | required | |
- expires_at: datetime | required | |
- notified_at: datetime | | | |
- created_at: datetime | required | | now()

---

## notification

- id: uuid | required | auto-generated | primary key
- user_id: uuid | | relation: users.id |
- pharmacy_id: uuid | | relation: pharmacies.id | optional target
- type: text | required | | | enum: request / response / reservation / waiting / payment / subscription
- title: text | required | |
- body: text | required | |
- deep_link: text | | | |
- read_at: datetime | | | |
- created_at: datetime | required | | now()

---

## subscription

- id: uuid | required | auto-generated | primary key
- user_id: uuid | | relation: users.id | optional patient link
- pharmacy_id: uuid | | relation: pharmacies.id | optional pharmacy link
- plan_id: uuid | required | |
- status: text | required | | trial | enum: trial / active / past_due / expired / cancelled
- trial_ends_at: datetime | | | |
- current_period_start: datetime | | | |
- current_period_end: datetime | | | |
- cancel_at_period_end: boolean | required | | false
- created_at: datetime | required | | now()

---

## payment

- id: uuid | required | auto-generated | primary key
- subscription_id: uuid | | relation: subscription.id |
- user_id: uuid | | relation: users.id |
- pharmacy_id: uuid | | relation: pharmacies.id | optional
- amount: number | required | | | decimal(10,2)
- currency: text | required | | XOF
- provider: text | required | | | enum: orange_money / wave
- provider_transaction_id: text | required | unique |
- status: text | required | | pending | enum: pending / authorized / succeeded / failed / refunded
- raw_payload: json | | | | webhook payload
- created_at: datetime | required | | now()

---

## support_ticket

- id: uuid | required | auto-generated | primary key
- user_id: uuid | required | relation: users.id
- tier: text | required | | tier1 | enum: tier1 / tier2 / tier3
- subject: text | required | |
- body: text | required | |
- status: text | required | | open | enum: open / in_progress / resolved / closed
- assigned_to: uuid | | relation: users.id |
- resolved_at: datetime | | | |
- created_at: datetime | required | | now()

---

## system_setting

- id: uuid | required | auto-generated | primary key
- key: text | required | unique |
- value: json | required | |
- description: text | | | |
- updated_by: uuid | | relation: users.id |
- created_at: datetime | required | | now()
- updated_at: datetime | required | | now()

---

## otp_verifications

- id: uuid | required | auto-generated | primary key
- user_id: uuid | | relation: users.id |
- phone: text | required | |
- code_hash: text | required | |
- purpose: text | required | | | enum: login / reset / link
- attempts: number | required | | 0
- locked_until: datetime | | | |
- expires_at: datetime | required | |
- consumed_at: datetime | | | |
- created_at: datetime | required | | now()

---

## refresh_tokens

- id: uuid | required | auto-generated | primary key
- user_id: uuid | required | relation: users.id
- token_hash: text | required | |
- expires_at: datetime | required | |
- rotated_at: datetime | | | |
- revoked_at: datetime | | | |
- created_at: datetime | required | | now()

---

## push_tokens

- id: uuid | required | auto-generated | primary key
- user_id: uuid | required | relation: users.id
- token: text | required | | | FCM device token
- platform: text | required | | | enum: ios / android / web
- is_active: boolean | required | | true
- last_used_at: datetime | | | |
- pruned_at: datetime | | | |
- created_at: datetime | required | | now()

---

## audit_logs

- id: uuid | required | auto-generated | primary key
- user_id: uuid | | relation: users.id |
- pharmacy_id: uuid | | relation: pharmacies.id | optional
- action: text | required | |
- entity_type: text | required | |
- entity_id: text | required | |
- old_values: json | | | |
- new_values: json | | | |
- created_at: datetime | required | | now()

---

## Indexes to add in Xano

After creating tables, add these indexes via Xano Database > Indexes:

- users_phone_idx: users(phone)
- users_email_idx: users(email)
- otp_phone_purpose_idx: otp_verifications(phone, purpose, created_at)
- refresh_tokens_user_idx: refresh_tokens(user_id, revoked_at)
- push_tokens_user_idx: push_tokens(user_id, pruned_at)
- organizations_registration_idx: organizations(registration_number)
- pharmacies_location_idx: pharmacies(lat, lng)
- pharmacies_status_idx: pharmacies(approval_status)
- pharmacy_staff_pharmacy_user_idx: pharmacy_staff(pharmacy_id, user_id)
- pharmacy_document_pharmacy_idx: pharmacy_document(pharmacy_id)
- pharmacy_hours_pharmacy_day_idx: pharmacy_hours(pharmacy_id, day_of_week)
- garde_dates_pharmacy_idx: garde_dates(pharmacy_id, start_at, end_at)
- medicine_requests_patient_idx: medicine_request(patient_id, created_at)
- medicine_requests_expires_status_idx: medicine_request(expires_at, status)
- request_items_request_idx: request_item(request_id)
- request_pharmacies_request_pharmacy_idx: request_pharmacies(request_id, pharmacy_id)
- pharmacy_responses_request_status_idx: pharmacy_response(request_id, status)
- reservations_state_hold_idx: reservation(state, hold_expires_at)
- waitlists_pharmacy_state_ready_idx: waitlist(pharmacy_id, state, ready_at)
- notifications_user_read_idx: notification(user_id, read_at)
- subscriptions_status_idx: subscription(status, current_period_end)
- payment_provider_txn_idx: payment(provider_transaction_id)
- audit_logs_entity_idx: audit_logs(entity_type, entity_id, created_at)
- pharmacy_inventory_pharmacy_catalog_idx: pharmacy_inventory(pharmacy_id, medicine_catalog_id)
- inventory_update_inventory_idx: inventory_update(pharmacy_inventory_id)
