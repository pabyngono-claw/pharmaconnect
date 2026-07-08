# Seed Data README — PharmaConnect v2.0

Files here create a deterministic demo dataset for one Senegal region with 2 orgs, 2 active pharmacies, 3 staff, 3 patients, 1 active request, 2 responses, 1 reservation, and 1 active subscription.

## Execution order

1. backend/xano/schema.sql
2. backend/xano/seed/01-organization.sql
3. backend/xano/seed/02-users.sql
4. backend/xano/seed/03-documents.sql
5. backend/xano/seed/04-active-flow.sql
6. backend/xano/seed/05-subscriptions.sql

## IDs cheat sheet
- Organization: `...0001` Demo, `...0002` Backend
- Pharmacy: `...0001` approved, `...0002` pending, `...0003` approved
- Staff users: `200...0001` owner pharmacy 001, `200...0002` owner pharmacy 003, `200...0003` manager pharmacy 001
- Patients: `300...0001`, `300...0002`, `300...0003`
- Requests: `500...0001`, `500...0002`
- Reservation: `800...0001`

## Landmark coordinates
- Pharmacy 001 Plateau: lat 14.7167, lng -17.4677
- Pharmacy 003 Almadies: lat 14.7358, lng -17.4956

## Notes
- Example URLs point to example.com because local storage/upload requires live bucket.
- Real QR/bill data replaces example URLs in production seed.
- Runs should be idempotent because every INSERT uses ON CONFLICT DO NOTHING where applicable.
