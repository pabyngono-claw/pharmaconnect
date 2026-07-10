# Xano Requests Group — Copy/Paste Setup

Build this in Xano: API Groups > Create Group > name = `requests`.

After creating the group, add each route and function below exactly as written.

---

## 1) POST /requests

### Steps
1. In the `requests` group, click **Add Function**.
2. Name: `create`
3. Add route: `POST /requests`
4. Set input:
   - `product_type`: string
   - `notes`: string?
   - `quantity`: integer?
   - `images`: array of objects?
   - `metadata`: jsonb?

### Function logic

**Action 1: Validate required fields**
- Add action: `Branch`
- Condition: `input.product_type == null`
  - **If yes:** Return Error `400`
    ```
    {"error":{"code":"VALIDATION_ERROR","message":"product_type is required","field_errors":[{"field":"product_type","message":"required"}]}}
    ```
    Stop flow.

**Action 2: Resolve patient**
- Add action: `Transform`
- Expression: `context.access_token && context.access_token.user_id ? context.access_token.user_id : null`
- Output variable: `patient_id`

**Action 3: Set expiry**
- Add action: `Transform`
- Expression: `now + 72 hours`
- Output variable: `expires_at`

**Action 4: Insert medicine_request**
- Add action: `Add Record`
- Table: `medicine_request`
- Fields:
  - `patient_id`: `patient_id`
  - `product_type`: `input.product_type`
  - `notes`: `input.notes || null`
  - `quantity`: `input.quantity || null`
  - `expires_at`: `expires_at`
  - `re_broadcast_suggested`: `false`
  - `status`: `"submitted"`
  - `created_at`: `now`
  - `updated_at`: `now`
- Output variable: `request`

**Action 5: Insert request_item if images provided**
- Add action: `Loop`
- Array: `input.images`
- Index variable: `idx`
- Item variable: `img`
- Inside loop:
  - Add action: `Add Record`
  - Table: `request_item`
  - Fields:
    - `medicine_request_id`: `request.id`
    - `sort`: `idx`
    - `url`: `img.url`
    - `created_at`: `now`
- End loop

**Action 6: Find nearby pharmacies**
- Add action: `Query`
- Table: `pharmacies`
- Filter:
  - `is_active == true`
  - `approval_status == "approved"`
- Output variable: `nearby`

**Action 7: Insert request_pharmacies (fan-out)**
- Add action: `Loop`
- Array: `nearby`
- Index variable: `pi`
- Item variable: `pharm`
- Inside loop:
  - Add action: `Add Record`
  - Table: `request_pharmacies`
  - Fields:
    - `medicine_request_id`: `request.id`
    - `pharmacy_id`: `pharm.id`
    - `status`: `"pending"`
    - `created_at`: `now`
- End loop

**Action 8: Create notification for patient**
- Add action: `Add Record`
- Table: `notification`
- Fields:
  - `user_id`: `patient_id`
  - `pharmacy_id`: `null`
  - `type`: `"request"`
  - `title`: `"Request submitted"`
  - `body`: `"Your request has been sent to {{ nearby.length }} pharmacies."`
  - `deep_link`: `"/requests/{{ request.id }}"`
  - `read_at`: `null`
  - `created_at`: `now`

**Action 9: Return success**
- Add action: `Return`
- Status: `201`
- Body:
  ```
  {
    "medicine_request_id": "{{ request.id }}",
    "expires_at": "{{ expires_at }}"
  }
  ```

---

## 2) POST /requests/:id/link

### Steps
1. Add Function: `link`
2. Route: `POST /requests/:id/link`
3. Path parameter: `id`
4. Input:
   - `access_token`: string

### Function logic

**Action 1: Fetch request**
- Add action: `Query`
- Table: `medicine_request`
- Filter: `id == route.id`
- Limit: `1`
- Output variable: `req`

**Action 2: Branch — not found**
- Condition: `req === null`
  - **If yes:** Return Error `404`
    ```
    {"error":{"code":"NOT_FOUND","message":"Request not found","field_errors":[]}}
    ```
    Stop flow.

**Action 3: Branch — already linked or expired**
- Add action: `Branch`
- Condition: `req.patient_id != null || req.expires_at <= now`
  - **If yes:** Return Error `400`
    ```
    {"error":{"code":"INVALID_LINK","message":"Request already linked or expired","field_errors":[]}}
    ```
    Stop flow.

**Action 4: Resolve user from token**
- Add action: `Query`
- Table: `users`
- Filter: `id == input.access_token.user_id`
- Limit: `1`
- Output variable: `user`

**Action 5: Branch — invalid token**
- Condition: `user === null`
  - **If yes:** Return Error `401`
    ```
    {"error":{"code":"UNAUTHORIZED","message":"Invalid access token","field_errors":[]}}
    ```
    Stop flow.

**Action 6: Update request**
- Add action: `Update Record`
- Table: `medicine_request`
- Find by: `id == req.id`
- Set: `patient_id = user.id`

**Action 7: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "medicine_request_id": "{{ req.id }}"
  }
  ```

---

## 3) GET /requests/:id

### Steps
1. Add Function: `get`
2. Route: `GET /requests/:id`
3. Path parameter: `id`

### Function logic

**Action 1: Fetch request**
- Add action: `Query`
- Table: `medicine_request`
- Filter: `id == route.id`
- Limit: `1`
- Output variable: `req`

**Action 2: Branch — not found**
- Condition: `req === null`
  - **If yes:** Return Error `404` (same format). Stop flow.

**Action 3: Resolve user**
- Add action: `Query`
- Table: `users`
- Filter: `id == context.access_token.user_id`
- Output variable: `me`

**Action 4: Branch — auth check**
- Add action: `Branch`
- Condition: `me === null || (req.patient_id != me.id && me.role != "admin")`
  - **If yes:** Return Error `403`
    ```
    {"error":{"code":"FORBIDDEN","message":"You do not own this request","field_errors":[]}}
    ```
    Stop flow.

**Action 5: Fetch request items**
- Add action: `Query`
- Table: `request_item`
- Filter: `medicine_request_id == req.id`
- Sort by: `sort`
- Output variable: `images`

**Action 6: Fetch request_pharmacies**
- Add action: `Query`
- Table: `request_pharmacies`
- Filter: `medicine_request_id == req.id`
- Output variable: `rp_list`

**Action 7: Loop and enrich pharmacy info**
- Add action: `Loop`
- Array: `rp_list`
- Index variable: `i`
- Item variable: `rp`
- Inside loop:
  - Add action: `Query`
  - Table: `pharmacies`
  - Filter: `id == rp.pharmacy_id`
  - Output variable: `pharm`
  - Add action: `Update Variable`
  - Key: `rp.pharmacy_name = pharm.name`
  - Add action: `Update Variable`
  - Key: `rp.address = pharm.address || null`
  - Add action: `Update Variable`
  - Key: `rp.quartier = pharm.quartier || null`
  - Add action: `Update Variable`
  - Key: `rp.phone = pharm.phone || null`
- End loop

**Action 8: Fetch pharmacy_responses where available**
- Add action: `Query`
- Table: `pharmacy_response`
- Filter: `medicine_request_id == req.id`
- Output variable: `responses`

**Action 9: Build response map**
- Add action: `Transform`
- Expression: `responses.reduce((map, r) => map.set(r.pharmacy_id, r), new Map())`
- Output variable: `resp_map`

**Action 10: Build pharmacies array**
- Add action: `Loop`
- Array: `rp_list`
- Item variable: `rp`
- Output variable: `pharmacies_items`
  - Add action: `Transform`
  - Expression: `{pharmacy_id: rp.pharmacy_id, name: rp.pharmacy_name, status: rp.status, response: resp_map.get(rp.pharmacy_id) || null}`
- End loop

**Action 11: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "medicine_request_id": "{{ req.id }}",
    "product_type": "{{ req.product_type }}",
    "status": "{{ req.status }}",
    "expires_at": "{{ req.expires_at }}",
    "notes": "{{ req.notes }}",
    "quantity": {{ req.quantity }},
    "images": "{{ images }}",
    "pharmacies": "{{ pharmacies_items }}"
  }
  ```

---

## 4) GET /requests

### Steps
1. Add Function: `list`
2. Route: `GET /requests`
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

**Action 2: Branch — no auth**
- Condition: `me === null`
  - **If yes:** Return Error `401`
    ```
    {"error":{"code":"UNAUTHORIZED","message":"Access token required","field_errors":[]}}
    ```
    Stop flow.

**Action 3: Base query**
- Add action: `Query`
- Table: `medicine_request`
- Filter: `patient_id == me.id`
- Optional filters:
  - If `status` query param present: add filter `status == query.status`
- Sort by: `created_at desc`
- Pagination: use `page` and `limit` inputs (default page=1, limit=20)
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

## 5) POST /reservations

### Steps
1. Add Function: `create`
2. Route: `POST /reservations`
3. Input:
   - `medicine_request_id`: string
   - `response_id`: string
   - `pharmacy_id`: string
4. Header:
   - `Idempotency-Key`: string (required)

### Function logic

**Action 1: Check idempotency — fetch request + response first**
- Add action: `Query`
- Table: `medicine_request`
- Filter: `id == input.medicine_request_id`
- Limit: `1`
- Output variable: `req`

**Action 2: Branch — request missing or expired**
- Condition: `req === null || req.expires_at <= now`
  - **If yes:** Return Error `400`
    ```
    {"error":{"code":"INVALID_REQUEST","message":"Request not found or expired","field_errors":[]}}
    ```
    Stop flow.

**Action 3: Fetch response**
- Add action: `Query`
- Table: `pharmacy_response`
- Filter:
  - `id == input.response_id`
  - `medicine_request_id == input.medicine_request_id`
  - `pharmacy_id == input.pharmacy_id`
- Limit: `1`
- Output variable: `resp`

**Action 4: Branch — response missing/unavailable**
- Condition: `resp === null || resp.status != "available"`
  - **If yes:** Return Error `409`
    ```
    {"error":{"code":"UNAVAILABLE_RESPONSE","message":"Response not available for reservation","field_errors":[]}}
    ```
    Stop flow.

**Action 5: Check idempotency key**
- Add action: `Query`
- Table: `reservation`
- Filter: `metadata.idempotency_key == request.headers.Idempotency-Key`
- Limit: `1`
- Output variable: `existing`

**Action 6: Branch — duplicate request**
- Condition: `existing !== null`
  - **If yes:** Return `200`
    - Body: `{"reservation_id": "{{ existing.id }}"}`
    - Stop flow (no new record created).

**Action 7: Calculate hold expiry**
- Add action: `Transform`
- Expression: `now + 2 hours`
- Output variable: `hold_expires_at`

**Action 8: Insert reservation**
- Add action: `Add Record`
- Table: `reservation`
- Fields:
  - `medicine_request_id`: `req.id`
  - `response_id`: `input.response_id`
  - `pharmacy_id`: `input.pharmacy_id`
  - `patient_id`: `req.patient_id`
  - `status`: `"submitted"`
  - `hold_expires_at`: `hold_expires_at`
  - `served_at`: `null`
  - `metadata`: `{idempotency_key: request.headers["Idempotency-Key"]}`
  - `created_at`: `now`
  - `updated_at`: `now`
- Output variable: `reservation`

**Action 9: Update response**
- Add action: `Update Record`
- Table: `pharmacy_response`
- Find by: `id == resp.id`
- Set: `status = "reserved"`

**Action 10: Create notifications**
- Add action: `Add Record`
- Table: `notification`
- Fields:
  - `user_id`: `req.patient_id`
  - `pharmacy_id`: `input.pharmacy_id`
  - `type`: `"reservation"`
  - `title`: `"Reservation created"`
  - `body`: `"Your reservation is confirmed. Pickup expires {{ hold_expires_at.toISOString() }}"`
  - `deep_link`: `"/reservations/{{ reservation.id }}"`
  - `read_at`: `null`
  - `created_at`: `now`

- Add action: `Add Record`
- Table: `notification`
  - `user_id`: (fetch pharmacy owner — query pharmacy_staff where pharmacy_id=input.pharmacy_id and role=owner limit 1)
  - `pharmacy_id`: `input.pharmacy_id`
  - `type`: `"reservation"`
  - `title`: `"New reservation received"`
  - `body`: `"Patient reserved your offer. Ready for pickup."`
  - `deep_link`: `"/reservations/{{ reservation.id }}"`
  - `read_at`: `null`
  - `created_at`: `now`

**Action 11: Return success**
- Add action: `Return`
- Status: `201`
- Body:
  ```
  {
    "reservation_id": "{{ reservation.id }}"
  }
  ```

---

## Validation Checklist

Use these rules before confirming each function:

- `product_type` must be one of: `prescription`, `product`, `equipment`
- `notes` truncated to 500 chars max
- `images` array max 5 items
- `quantity` minimum 1
- `limit` query param max 100
- `Idempotency-Key` header required on `/reservations`
- Access token required for patient-owned requests
- Expired requests cannot be linked or reserved

---

## Common Issues

**"request_pharmacies not populated"**
- Ensure Action 6 query returns pharmacies where `is_active == true` and `approval_status == "approved"`.

**"Notification not sent to pharmacy"**
- Ensure `pharmacy_staff` has at least one owner row for the pharmacy_id.

**"501 GET /requests/:id => null"**
- Ensure `request_item` rows have `sort` populated; loop returns empty if `sort` missing.