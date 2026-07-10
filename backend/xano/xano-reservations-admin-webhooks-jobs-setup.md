# Xano Reservations Group — Copy/Paste Setup

Build this in Xano: API Groups > Create Group > name = `reservations`.

---

## 1) GET /reservations/:id

### Steps
1. Add Function: `get`
2. Route: `GET /reservations/:id`
3. Path parameter: `id`

### Function logic

**Action 1: Fetch reservation**
- Add action: `Query`
- Table: `reservation`
- Filter: `id == route.id`
- Limit: `1`
- Output variable: `res`

**Action 2: Branch — not found**
- Condition: `res === null`
  - **If yes:** Return Error `404`
    ```
    {"error":{"code":"NOT_FOUND","message":"Reservation not found","field_errors":[]}}
    ```
    Stop flow.

**Action 3: Fetch pharmacy name**
- Add action: `Query`
- Table: `pharmacies`
- Filter: `id == res.pharmacy_id`
- Limit: `1`
- Output variable: `pharm`

**Action 4: Fetch medicine_request**
- Add action: `Query`
- Table: `medicine_request`
- Filter: `id == res.medicine_request_id`
- Limit: `1`
- Output variable: `req`

**Action 5: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "reservation_id": "{{ res.id }}",
    "status": "{{ res.status }}",
    "pharmacy_id": "{{ res.pharmacy_id }}",
    "pharmacy_name": "{{ pharm ? pharm.name : null }}",
    "medicine_request_id": "{{ res.medicine_request_id }}",
    "product_type": "{{ req ? req.product_type : null }}",
    "notes": "{{ req ? req.notes : null }}",
    "hold_expires_at": "{{ res.hold_expires_at }}",
    "ready_at": "{{ res.ready_at }}",
    "served_at": "{{ res.served_at }}",
    "created_at": "{{ res.created_at }}"
  }
  ```

---

## 2) GET /reservations

### Steps
1. Add Function: `list`
2. Route: `GET /reservations`
3. Query parameters:
   - `page`: integer?
   - `limit`: integer?
   - `status`: string?

### Function logic

**Action 1: Resolve user**
- Add action: `Query`
- Table: `users`
- Filter: `id == context.access_token.user_id`
- Limit: `1`
- Output variable: `me`

**Action 2: Branch — not found**
- Condition: `me === null`
  - **If yes:** Return Error `401`
    ```
    {"error":{"code":"UNAUTHORIZED","message":"Access token required","field_errors":[]}}
    ```
    Stop flow.

**Action 3: Branch — role routing**
- Add action: `Branch`
- Condition: `me.role == "pharmacy"`
  - **If yes:**
    - Add action: `Query`
    - Table: `pharmacy_staff`
    - Filter: `user_id == me.id`
    - Output variable: `my_pharmacies`
    - Add action: `Query`
    - Table: `reservation`
    - Filter: `pharmacy_id IN my_pharmacies.map(s => s.pharmacy_id)`
    - Optional: `status == query.status` if provided
    - Sort by: `created_at desc`
    - Pagination: `page`/`limit` (default limit=20)
    - Output variable: `result`
  - **If no:** (patient or admin)
    - Add action: `Query`
    - Table: `reservation`
    - Filter: `patient_id == me.id`
    - Optional: `status == query.status` if provided
    - Sort by: `created_at desc`
    - Pagination: `page`/`limit`
    - Output variable: `result`

**Action 4: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "items": "{{ result.items }}",
    "page": {{ query.page || 1 }},
    "limit": {{ query.limit || 20 }},
    "total": {{ result.total }}
  }
  ```

---

## 3) POST /reservations/:id/cancel

### Steps
1. Add Function: `cancel`
2. Route: `POST /reservations/:id/cancel`
3. Path parameter: `id`
4. Input:
   - `reason`: string?

### Function logic

**Action 1: Fetch reservation**
- Add action: `Query`
- Table: `reservation`
- Filter: `id == route.id`
- Limit: `1`
- Output variable: `res`

**Action 2: Branch — not found**
- Condition: `res === null`
  - **If yes:** Return Error `404` (same format). Stop flow.

**Action 3: Branch — not actionable**
- Condition: `res.status IN ["served", "cancelled"]`
  - **If yes:** Return Error `409`
    ```
    {"error":{"code":"NOT_ACTIONABLE","message":"Reservation already completed or cancelled","field_errors":[]}}
    ```
    Stop flow.

**Action 4: Update reservation**
- Add action: `Update Record`
- Table: `reservation`
- Find by: `id == res.id`
- Set:
  - `status = "cancelled"`
  - `cancelled_at = now`
  - `cancel_reason = input.reason || null`

**Action 5: Update response back to available**
- Add action: `Query`
- Table: `pharmacy_response`
- Filter: `id == res.response_id`
- Limit: `1`
- Output variable: `resp`
- Add action: `Update Record`
- Table: `pharmacy_response`
- Find by: `id == resp.id`
- Set: `status = "available"` (if found)

**Action 6: Audit Log**
- Add action: `Add Record`
- Table: `audit_logs`
- Fields:
  - `user_id`: `context.access_token.user_id`
  - `pharmacy_id`: `res.pharmacy_id`
  - `action`: `"cancel_reservation"`
  - `entity_type`: `"reservation"`
  - `entity_id`: `res.id`
  - `old_values`: `{status: res.status}`
  - `new_values`: `{status: "cancelled", reason: input.reason}`
  - `created_at`: `now`

**Action 7: Notify pharmacy**
- Add action: `Add Record`
- Table: `notification`
- Fields:
  - `user_id`: (first staff for pharmacy — fetch pharmacy_staff where pharmacy_id=res.pharmacy_id limit 1)
  - `pharmacy_id`: `res.pharmacy_id`
  - `type`: `"reservation"`
  - `title`: `"Reservation cancelled"`
  - `body`: `"Patient cancelled: {{ input.reason || 'no reason provided' }}"`
  - `deep_link`: `"/reservations/{{ res.id }}"`
  - `read_at`: `null`
  - `created_at`: `now`

**Action 8: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "reservation_id": "{{ res.id }}",
    "status": "cancelled"
  }
  ```

---

# Xano Admin Group — Copy/Paste Setup

Build this in Xano: API Groups > Create Group > name = `admin`.

All routes require admin role.

---

## 1) POST /pharmacy-documents/:id/approve

### Steps
1. Add Function: `approve-document`
2. Route: `POST /pharmacy-documents/:id/approve`
3. Path parameter: `id`
4. Input:
   - `action`: string ("approve" | "reject")
   - `admin_notes`: string?

### Function logic

**Action 1: Check admin role**
- Add action: `Query`
- Table: `users`
- Filter:
  - `id == context.access_token.user_id`
  - `role == "admin"`
- Limit: `1`
- Output variable: `admin_user`

**Action 2: Branch — not admin**
- Condition: `admin_user === null`
  - **If yes:** Return Error `403`
    ```
    {"error":{"code":"FORBIDDEN","message":"Admin access required","field_errors":[]}}
    ```
    Stop flow.

**Action 3: Fetch document**
- Add action: `Query`
- Table: `pharmacy_document`
- Filter: `id == route.id`
- Limit: `1`
- Output variable: `doc`

**Action 4: Branch — not found**
- Condition: `doc === null`
  - **If yes:** Return Error `404`. Stop flow.

**Action 5: Determine status**
- Add action: `Transform`
- Expression: `input.action == "approve" ? "approved" : "rejected"`
- Output variable: `new_status`

**Action 6: Update document**
- Add action: `Update Record`
- Table: `pharmacy_document`
- Find by: `id == doc.id`
- Set:
  - `status = new_status`
  - `reviewed_by = admin_user.id`
  - `reviewed_at = now`
  - `review_note = input.admin_notes || null`
  - `updated_at = now`

**Action 7: Check all documents approved for pharmacy**
- Add action: `Query`
- Table: `pharmacy_document`
- Filter: `pharmacy_id == doc.pharmacy_id`
- Output variable: `all_docs`

**Action 8: Auto-approve pharmacy if all approved**
- Add action: `Transform`
- Expression: `all_docs.every(d => d.status == "approved")`
- Output variable: `all_approved`
- Add action: `Branch`
- Condition: `all_approved == true`
  - **If yes:**
    - Add action: `Update Record`
    - Table: `pharmacy`
    - Find by: `id == doc.pharmacy_id`
    - Set: `approval_status = "approved"`

**Action 9: Audit Log**
- Add action: `Add Record`
- Table: `audit_logs`
- Fields:
  - `user_id`: `admin_user.id`
  - `pharmacy_id`: `doc.pharmacy_id`
  - `action`: `"review_document"`
  - `entity_type`: `"pharmacy_document"`
  - `entity_id`: `doc.id`
  - `old_values`: `{status: doc.status}`
  - `new_values`: `{status: new_status}`
  - `created_at`: `now`

**Action 10: Notify pharmacy**
- Add action: `Add Record`
- Table: `notification`
- Fields:
  - `user_id`: first staff user for pharmacy
  - `pharmacy_id`: `doc.pharmacy_id`
  - `type`: `"admin"`
  - `title`: `"Document {{ new_status }}"`
  - `body`: `"Your {{ doc.document_type }} document was {{ new_status }}."`
  - `deep_link`: `"/pharmacy/{{ doc.pharmacy_id }}/documents"`
  - `read_at`: `null`
  - `created_at`: `now`

**Action 11: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "document_id": "{{ doc.id }}",
    "status": "{{ new_status }}",
    "pharmacy_approved": "{{ all_approved || false }}"
  }
  ```

---

## 2) GET /audit-logs

### Steps
1. Add Function: `audit-logs`
2. Route: `GET /audit-logs`
3. Query parameters: `page`?, `limit`?, `action`?, `entity_type`?

### Function logic

**Action 1: Check admin role** (same as Action 1 above).

**Action 2: Query audit_logs**
- Add action: `Query`
- Table: `audit_logs`
- Optional filters:
  - If `action` query param: add filter `action == query.action`
  - If `entity_type` query param: add filter `entity_type == query.entity_type`
- Sort by: `created_at desc`
- Pagination: `page`/`limit` (default limit=50)
- Output variable: `result`

**Action 3: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "items": "{{ result.items }}",
    "page": {{ query.page || 1 }},
    "limit": {{ query.limit || 50 }},
    "total": {{ result.total }}
  }
  ```

---

## 3) GET /subscriptions

### Steps
1. Add Function: `subscriptions`
2. Route: `GET /subscriptions`

### Function logic — admin only, list subscriptions with pagination.

---

## 4) PUT /subscriptions/:id

### Steps
1. Add Function: `subscriptions-update`
2. Route: `PUT /subscriptions/:id`
3. Input: `status`?, `tier`?, `end_date`?

### Function logic — find subscription by id, update provided fields, audit log, return.

---

# Xano Webhooks Group — Copy/Paste Setup

Build this in Xano: API Groups > Create Group > name = `webhooks`.

**No auth middleware** — these receive callbacks from external providers.

---

## 1) POST /webhooks/payments/orange_money
## 2) POST /webhooks/payments/wave

Both use the same function. Create one function, route both endpoints.

### Steps
1. Add Function: `payments`
2. Route: `POST /webhooks/payments/orange_money` and `POST /webhooks/payments/wave`
3. Input:
   - `transaction_id`: string
   - `status`: string
   - `amount`: number?
   - `phone`: string?
   - `metadata`: jsonb?

### Function logic

**Action 1: Determine provider**
- Add action: `Transform`
- Expression: `route.path.includes("orange_money") ? "orange_money" : "wave"`
- Output variable: `provider`

**Action 2: Validate signature**
- Add action: `Branch`
- Condition: `request.headers["X-Webhook-Secret"] != env.ADMIN_API_KEY`
  - **If yes:** Return Error `401`. Stop.

**Action 3: Find payment by provider_transaction_id**
- Add action: `Query`
- Table: `payment`
- Filter: `provider_transaction_id == input.transaction_id`
- Limit: `1`
- Output variable: `existing`

**Action 4: Branch — duplicate**
- Condition: `existing !== null`
  - **If yes:** Return `200` `{"received": true}` (idempotent). Stop.

**Action 5: Find subscription**
- Add action: `Query`
- Table: `subscription`
- Filter: `payment_phone == input.phone` (or similar matching logic)
- Limit: `1`
- Output variable: `sub`

**Action 6: Insert payment record**
- Add action: `Add Record`
- Table: `payment`
- Fields:
  - `subscription_id`: `sub ? sub.id : null`
  - `provider`: `provider`
  - `provider_transaction_id`: `input.transaction_id`
  - `amount`: `input.amount || null`
  - `status`: `input.status`
  - `phone`: `input.phone || null`
  - `raw_payload`: `input.metadata || {}`
  - `created_at`: `now`

**Action 7: Branch — success**
- Condition: `input.status == "completed" && sub !== null`
  - **If yes:**
    - Add action: `Update Record`
    - Table: `subscription`
    - Find by: `id == sub.id`
    - Set: `status = "active"`, `start_date = now`, `end_date = now + 30 days`, `updated_at = now`
    - Add action: `Add Record` (notification)
    - Table: `notification`
    - Fields:
      - `user_id`: `sub.user_id` (or pharmacy owner)
      - `pharmacy_id`: `sub.pharmacy_id || null`
      - `type`: `"payment"`
      - `title`: `"Payment completed"`
      - `body`: `"Your subscription payment was successful."`
      - `deep_link`: `"/subscriptions/{{ sub.id }}"`
      - `read_at`: `null`
      - `created_at`: `now`

**Action 8: Audit Log**
- Add action: `Add Record`
- Table: `audit_logs`
- Fields:
  - `user_id`: `sub ? sub.user_id : null`
  - `pharmacy_id`: `sub ? sub.pharmacy_id : null`
  - `action`: `"payment_webhook"`
  - `entity_type`: `"payment"`
  - `entity_id`: `(payment id from step 6)`
  - `old_values`: `null`
  - `new_values`: `{provider: provider, status: input.status, amount: input.amount}`
  - `created_at`: `now`

**Action 9: Return success**
- Add action: `Return`
- Status: `200`
- Body: `{"received": true}`

---

# Xano Jobs Group — Copy/Paste Setup

Build this in Xano: API Groups > Create Group > name = `jobs`.

All routes protected by ADMIN_API_KEY header.

---

## 1) POST /jobs/expire-requests

Every 15 minutes. Finds requests where `expires_at <= now && status == "submitted"`, marks as `"expired"`.

**Action 1: Verify admin key** — compare header with `env.ADMIN_API_KEY`.

**Action 2: Query** `medicine_request` where `expires_at <= now && status == "submitted"`.

**Action 3: Loop** — update each to `status = "expired"`, `updated_at = now`.

**Action 4: Return** `{"expired_count": N}`.

---

## 2) POST /jobs/expire-reservations

Every 5 minutes. Finds reservations where `status == "submitted" && hold_expires_at <= now`.

**Action 1: Verify admin key.**

**Action 2: Query** matching reservations.

**Action 3: Loop** — set `status = "expired"`, `cancelled_at = now`, `cancel_reason = "auto-expire"`. Also release associated `pharmacy_response` back to `status = "available"`.

**Action 4: Return** `{"expired_count": N}`.

---

## 3) POST /jobs/expire-waiting-lists

Every 15 minutes. Remove entries where associated reservation is expired.

**Action 1: Verify admin key.**

**Action 2: Query** `waitlist` where associated reservation is expired.

**Action 3: Loop** — delete waitlist entries.

**Action 4: Return** `{"cleaned_count": N}`.

---

## 4) POST /jobs/renew-subscriptions

Daily 09:00 UTC. Find subscriptions ending in 3 days, send reminder notification.

**Action 1: Verify admin key.**

**Action 2: Query** `subscription` where `end_date BETWEEN now AND now + 3 days`.

**Action 3: Loop** — create `notification` of type `"subscription"` with title `"Renewal reminder"`, body `"Your subscription expires in 3 days."`.

**Action 4: Return** `{"notified_count": N}`.

---

## 5) POST /jobs/prune-push-tokens

Weekly Sunday 04:00 UTC. Remove entries where `created_at <= now - 90 days`.

**Action 1: Verify admin key.**

**Action 2: Query** `push_tokens` where `created_at <= now - 90 days`.

**Action 3: Loop** — delete.

**Action 4: Return** `{"pruned_count": N}`.

---

## Common Errors (Jobs)

| Error | Cause | Fix |
|-------|-------|-----|
| 401 on any job | Missing `ADMIN_API_KEY` header | Add header in Xano Scheduler config |
| 0 expired_count | No matching records found | Expected — job is running correctly |
| Wrong `status` on reservation | `hold_expires_at` not set on insert | Verify `reservation` insert includes `hold_expires_at = now + 2h` |