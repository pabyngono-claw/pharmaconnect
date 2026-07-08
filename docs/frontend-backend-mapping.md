# Front/Back Schema Mapping — PharmaConnect v2.0

Reference grid: FlutterFlow screen or form field -> Xano table/field -> API endpoint.
Use this when wiring FlutterFlow API calls without guessing request shapes.

| Flux FlutterFlow | Ecran / Formulaire | Table Xano | Champs front -> back | Endpoint Xano | Methode | Auth |
|---|---|---|---|---|---|---|
| Patient - Demande de medicament | /requests/new | requests | product_type, notes, quantity, prescription_image_id | /requests | POST | access |
| Patient - Suivi demande | /requests/:id | requests + reservations | id only | /requests/:id | GET | access |
| Patient - Mes reservations | /reservations/:id | reservations + reservations_items | id only | /reservations?request_id=:id | GET | access |
| Patient - Confirmation de retrait | /requests/:id/pharmacies | pharmacies + reservations | pharmacy_id, request_id, channel | /reservations | POST | access |
| Patient - Profil | /profile | users, patients | phone, name | /users/me | GET/PATCH | access |
| Pharmacie - Dashboard | /pharmacy/dashboard | pharmacy_staff, reservations, documents | none (list) | /pharmacies/:id/summary | GET | pharmacy |
| Pharmacie - Demandes reçues | /pharmacy/requests/:id | requests, reservations | id only | /pharmacies/requests?status=:status | GET | pharmacy |
| Pharmacie - Liste d'attente | /pharmacy/waiting-list | waiting_list | request_id or pharmacy_id, accept | /waiting-list | POST | pharmacy |
| Pharmacie - Upload document | /pharmacy/profile | pharmacy_documents | document_type, file_id | /pharmacy-documents | POST | pharmacy |
| Admin - Revue pharmacie | /admin/pharmacies/:id/review | pharmacies, pharmacy_documents, pharmacy_approval_status | pharmacy_id, status, note | /pharmacies/:id/approve | POST | admin |
| Admin - Demandes | /admin/requests | requests | id, status, note | /requests/:id/update-status | POST | admin |
| Paiement webhook | Back-office | payment_transactions, subscriptions | provider_transaction_id, status, amount | /webhooks/payments/:provider | POST | provider |
| Scheduler jobs | CI/Back-office | N/A (side effects) | aucun | /jobs/expire-requests | POST | admin |
| Scheduler jobs | CI/Back-office | N/A (side effects) | aucun | /jobs/expire-reservations | POST | admin |
| Scheduler jobs | CI/Back-office | N/A (side effects) | aucun | /jobs/expire-waiting-lists | POST | admin |
| Scheduler jobs | CI/Back-office | N/A (side effects) | aucun | /jobs/renew-subscriptions | POST | admin |
| Push notification | Flutter app | push_tokens | token, platform, user_id | /push-tokens | POST | access |

## Notes d'implementation
- `idempotency_key` requis pour toute mutation client sensible: reservations, documents, payments.
- `prescription_image_id` vient du bucket `prescriptions` apres upload.
- Les jobs scheduler utilisent un header interne admin si `ADMIN_API_KEY` est configure.
- Les webhooks doivent repondre 200 rapidement; le traitement long se fait dans Xano via fonction async.