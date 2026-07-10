# PharmaConnect Database Conventions — Official 26 Tables

These are the exact table names as they exist in Xano. Use these names
consistently in all API function code, documentation, and references.

| # | Table Name | Notes |
|---|------------|-------|
| 1 | `patients` | Core patient identity |
| 2 | `pharmacies` | Core pharmacy identity |
| 3 | `pharmacy_documents` | Pharmacy legal document uploads |
| 4 | `medicine_request` | Patient prescription/product requests |
| 5 | `request_item` | Prescription images per request |
| 6 | `pharmacy_response` | Pharmacy offers/rejections |
| 7 | `reservation` | Patient accepts pharmacy offer |
| 8 | `waitlist` | Queue for ready reservations per pharmacy |
| 9 | `notification` | Push/email notification records |
| 10 | `pharmacy_inventory` | Per-pharmacy medicine stock |
| 11 | `medicine_catalog` | Pharmacy-specific catalog entries |
| 12 | `inventory_update` | Stock change audit trail |
| 13 | `subscription` | Pharmacy subscription plans |
| 14 | `payment` | Payment transactions (Orange Money/Wave) |
| 15 | `support_ticket` | User support requests |
| 16 | `system_setting` | Global configuration key-values |
| 17 | `users` | Authentication identity |
| 18 | `otp_verifications` | OTP codes and attempt tracking |
| 19 | `refresh_tokens` | Session token rotation |
| 20 | `push_tokens` | FCM device tokens |
| 21 | `organizations` | Pharmacy legal entities |
| 22 | `pharmacy_staff` | Staff-to-pharmacy mapping |
| 23 | `pharmacy_hours` | Weekly opening hours |
| 24 | `garde_dates` | On-call scheduling |
| 25 | `request_pharmacies` | Fan-out linking requests to pharmacies |
| 26 | `audit_logs` | Compliance event journal |

## Naming Rules

1. **Singular for entities:** `patient`, `pharmacy`, `medicine_request`, `reservation`, `audit_logs`
2. **Plural for collections:** REMOVED — all tables use singular naming consistently.
3. **Foreign keys:** `<singular_table>_id`, e.g. `medicine_request_id`, `pharmacy_id`
4. **Status field:** Always `status` (never `state`)
5. **Timestamps:** `created_at`, `updated_at`, `deleted_at`
6. **Audit logs fields:** `user_id`, `pharmacy_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`
7. **Notification fields:** `user_id`, `pharmacy_id`, `type`, `title`, `body`, `deep_link`, `read_at`
8. **Payment fields:** `provider`, `provider_transaction_id`, `raw_payload`

## Cross-Reference

When writing a Xano function that references another table, use the exact
name from this list. Example:

- Query: `medicine_request` (not "requests")
- Query: `pharmacy_response` (not "responses")
- Query: `pharmacy_documents` (plural — matches Xano UI list name)
- Query: `request_item` (singular)