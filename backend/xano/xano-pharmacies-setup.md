# Xano Pharmacies Group — Copy/Paste Setup

Build this in Xano: API Groups > Create Group > name = `pharmacies`.

All routes below assume pharmacy staff authorization unless otherwise noted.

---

## 1) GET /pharmacies/:id/requests

### Steps
1. Add Function: `nearby-requests`
2. Route: `GET /pharmacies/:id/requests`
3. Path parameter: `id` = pharmacy_id
4. Query parameters:
   - `status`: string?
   - `page`: integer?
   - `limit`: integer?

### Function logic

**Action 1: Verify pharmacy staff**
- Add action: `Query`
- Table: `pharmacy_staff`
- Filter:
  - `user_id == context.access_token.user_id`
  - `pharmacy_id == route.id`
- Limit: `1`
- Output variable: `staff`

**Action 2: Branch — not staff**
- Condition: `staff === null`
  - **If yes:** Return Error `403`
    ```
    {"error":{"code":"FORBIDDEN","message":"You are not authorized for this pharmacy","field_errors":[]}}
    ```
    Stop flow.

**Action 3: Fetch request_pharmacies**
- Add action: `Query`
- Table: `request_pharmacies`
- Filter:
  - `pharmacy_id == route.id`
  - Optional: `status == query.status` if provided
- Sort by: `created_at desc`
- Pagination: `page`/`limit` (default limit=20)
- Output variable: `rp_list`

**Action 4: Enrich with medicine_request**
- Add action: `Loop`
- Array: `rp_list`
- Item variable: `rp`
- Inside loop:
  - Add action: `Query`
  - Table: `medicine_request`
  - Filter: `id == rp.request_id`
  - Limit: `1`
  - Output variable: `req`
  - Add action: `Update Variable`
  - Key: `rp.request = req`
- End loop

**Action 5: Filter expired requests**
- Add action: `Transform`
- Expression: `rp_list.filter(rp => rp.request && rp.request.expires_at > now)`
- Output variable: `items`

**Action 6: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "items": "{{ items }}",
    "page": {{ query.page || 1 }},
    "limit": {{ query.limit || 20 }},
    "total": {{ items.length }}
  }
  ```

---

## 2) POST /responses

### Steps
1. Add Function: `create`
2. Route: `POST /responses`
3. Input:
   - `request_id`: string
   - `action`: string
   - `reject_reason`: string?
   - `estimated_ready_minutes`: integer?

### Function logic

**Action 1: Verify pharmacy staff**
- Add action: `Query`
- Table: `pharmacy_staff`
- Filter:
  - `user_id == context.access_token.user_id`
- Output variable: `staff_list`

**Action 2: Fetch request + pharmacy link**
- Add action: `Query`
- Table: `request_pharmacies`
- Filter:
  - `request_id == input.request_id`
- Output variable: `rp`

**Action 3: Branch — not linked**
- Condition: `rp === null`
  - **If yes:** Return Error `404`
    ```
    {"error":{"code":"NOT_FOUND","message":"Request not linked to your pharmacy","field_errors":[]}}
    ```
    Stop flow.

**Action 4: Check staff for pharmacy**
- Add action: `Branch`
- Condition: `staff_list.every(s => s.pharmacy_id != rp.pharmacy_id)`
  - **If yes:** Return Error `403`
    ```
    {"error":{"code":"FORBIDDEN","message":"You are not authorized for this pharmacy","field_errors":[]}}
    ```
    Stop flow.

**Action 5: Fetch request**
- Add action: `Query`
- Table: `medicine_request`
- Filter: `id == input.request_id`
- Limit: `1`
- Output variable: `req`

**Action 6: Branch — expired or reserved**
- Add action: `Branch`
- Condition: `req.expires_at <= now || req.status == "reserved"`
  - **If yes:** Return Error `409`
    ```
    {"error":{"code":"EXPIRED_OR_RESERVED","message":"Request is no longer actionable","field_errors":[]}}
    ```
    Stop flow.

**Action 7: Determine new status**
- Add action: `Transform`
- Expression: `input.action == "reject" ? "rejected" : "available"`
- Output variable: `new_status`

**Action 8: Update request_pharmacies**
- Add action: `Update Record`
- Table: `request_pharmacies`
- Find by: `id == rp.id`
- Set:
  - `status = new_status`
  - `updated_at = now`

**Action 9: Insert pharmacy_response**
- Add action: `Add Record`
- Table: `pharmacy_response`
- Fields:
  - `request_id`: `input.request_id`
  - `pharmacy_id`: `rp.pharmacy_id`
  - `status`: `new_status`
  - `reject_reason`: `input.action == "reject" ? input.reject_reason || null : null`
  - `estimated_ready_minutes`: `new_status == "available" ? input.estimated_ready_minutes || null : null`
  - `created_at`: `now`
- Output variable: `resp`

**Action 10: Audit Log**
- Add action: `Add Record`
- Table: `audit_logs`
- Fields:
  - `actor_type`: `"user"`
  - `actor_id`: `context.access_token.user_id`
  - `action`: `"create_response"`
  - `target_type`: `"request"`
  - `target_id`: `input.request_id`
  - `metadata`: `{pharmacy_id: rp.pharmacy_id, status: new_status}`
  - `created_at`: `now`

**Action 11: Notify patient**
- Add action: `Add Record`
- Table: `notification`
- Fields:
  - `user_id`: `req.patient_id`
  - `type`: `"response_received"`
  - `payload`: `{request_id: req.id, pharmacy_id: rp.pharmacy_id, status: new_status, response_id: resp.id}`
  - `read`: `false`
  - `created_at`: `now`

**Action 12: Return success**
- Add action: `Return`
- Status: `201`
- Body:
  ```
  {
    "response_id": "{{ resp.id }}",
    "status": "{{ new_status }}"
  }
  ```

---

## 3) GET /pharmacies/:id/waiting-list

### Steps
1. Add Function: `waiting-list`
2. Route: `GET /pharmacies/:id/waiting-list`
3. Path parameter: `id` = pharmacy_id

### Function logic

**Action 1: Verify pharmacy staff**
- Add action: `Query`
- Table: `pharmacy_staff`
- Filter:
  - `user_id == context.access_token.user_id`
  - `pharmacy_id == route.id`
- Limit: `1`
- Output variable: `staff`

**Action 2: Branch — not staff**
- Condition: `staff === null`
  - **If yes:** Return Error `403`
    ```
    {"error":{"code":"FORBIDDEN","message":"You are not authorized for this pharmacy","field_errors":[]}}
    ```
    Stop flow.

**Action 3: Fetch waiting list**
- Add action: `Query`
- Table: `waitlist`
- Filter:
  - `pharmacy_id == route.id`
- Sort by: `queued_at asc`
- Output variable: `wl`

**Action 4: Enrich with request info**
- Add action: `Loop`
- Array: `wl`
- Item variable: `entry`
- Inside loop:
  - Add action: `Query`
  - Table: `medicine_request`
  - Filter: `id == entry.request_id`
  - Limit: `1`
  - Output variable: `req`
  - Add action: `Update Variable`
  - Key: `entry.request = req`
- End loop

**Action 5: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "items": "{{ wl }}"
  }
  ```

---

## 4) POST /reservations/:id/mark-ready

### Steps
1. Add Function: `mark-ready`
2. Route: `POST /reservations/:id/mark-ready`
3. Path parameter: `id` = reservation_id

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

**Action 3: Verify pharmacy staff for this reservation**
- Add action: `Query`
- Table: `pharmacy_staff`
- Filter:
  - `user_id == context.access_token.user_id`
  - `pharmacy_id == res.pharmacy_id`
- Limit: `1`
- Output variable: `staff`

**Action 4: Branch — not authorized**
- Condition: `staff === null`
  - **If yes:** Return Error `403`
    ```
    {"error":{"code":"FORBIDDEN","message":"You are not authorized for this pharmacy","field_errors":[]}}
    ```
    Stop flow.

**Action 5: Update reservation state**
- Add action: `Update Record`
- Table: `reservation`
- Find by: `id == res.id`
- Set:
  - `state = "ready"`
  - `ready_at = now`

**Action 6: Remove from waitlist if present**
- Add action: `Query`
- Table: `waitlist`
- Filter:
  - `reservation_id == res.id`
  - `pharmacy_id == res.pharmacy_id`
- Limit: `1`
- Output variable: `wl_entry`

- Add action: `Branch`
- Condition: `wl_entry !== null`
  - **If yes:**
    - Add action: `Delete Record`
    - Table: `waitlist`
    - Find by: `id == wl_entry.id`

**Action 7: Audit Log**
- Add action: `Add Record`
- Table: `audit_logs`
- Fields:
  - `actor_type`: `"user"`
  - `actor_id`: `context.access_token.user_id`
  - `action`: `"mark_ready"`
  - `target_type`: `"reservation"`
  - `target_id`: `res.id`
  - `metadata`: `{pharmacy_id: res.pharmacy_id}`
  - `created_at`: `now`

**Action 8: Notify patient**
- Add action: `Add Record`
- Table: `notification`
- Fields:
  - `user_id`: `res.patient_id`
  - `type`: `"reservation_ready"`
  - `payload`: `{reservation_id: res.id, pharmacy_id: res.pharmacy_id}`
  - `read`: `false`
  - `created_at`: `now`

**Action 9: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "reservation_id": "{{ res.id }}",
    "state": "ready"
  }
  ```

---

## 5) POST /reservations/:id/mark-served

### Steps
1. Add Function: `mark-served`
2. Route: `POST /reservations/:id/mark-served`
3. Path parameter: `id` = reservation_id

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

**Action 3: Verify pharmacy staff**
- Add action: `Query`
- Table: `pharmacy_staff`
- Filter:
  - `user_id == context.access_token.user_id`
  - `pharmacy_id == res.pharmacy_id`
- Limit: `1`
- Output variable: `staff`

**Action 4: Branch — not authorized**
- Condition: `staff === null`
  - **If yes:** Return Error `403`
    ```
    {"error":{"code":"FORBIDDEN","message":"You are not authorized for this pharmacy","field_errors":[]}}
    ```
    Stop flow.

**Action 5: Update reservation**
- Add action: `Update Record`
- Table: `reservation`
- Find by: `id == res.id`
- Set:
  - `state = "served"`
  - `served_at = now`

**Action 6: Audit Log**
- Add action: `Add Record`
- Table: `audit_logs`
- Fields:
  - `actor_type`: `"user"`
  - `actor_id`: `context.access_token.user_id`
  - `action`: `"mark_served"`
  - `target_type`: `"reservation"`
  - `target_id`: `res.id`
  - `metadata`: `{pharmacy_id: res.pharmacy_id, request_id: res.request_id, response_id: res.response_id}`
  - `created_at`: `now`

**Action 7: Notify patient**
- Add action: `Add Record`
- Table: `notification`
- Fields:
  - `user_id`: `res.patient_id`
  - `type`: `"reservation_served"`
  - `payload`: `{reservation_id: res.id, pharmacy_id: res.pharmacy_id}`
  - `read`: `false`
  - `created_at`: `now`

**Action 8: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "reservation_id": "{{ res.id }}",
    "state": "served"
  }
  ```

---

## Common Errors

| Error | Cause |Fix |
|-------|-------|-----|
| 403 on `/pharmacies/:id/requests` | No `pharmacy_staff` row for `context.access_token.user_id` | Add user as staff in Xano |
| 404 on `/responses` | `request_pharmacies` row missing | Ensure `/requests` fan-out completed |
| 409 on `/responses` | `medicine_request.expires_at <= now` or `status == reserved` | Patient must wait for new request |
| 404 on `/waiting-list` | `waitlist` empty or pharmacy not staffed | Check waiting list in Database UI |