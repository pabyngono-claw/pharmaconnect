# Xano Auth Group — Copy/Paste Setup

Build this in Xano: API Groups > Create Group > name = `auth`.

After creating the group, add each route and function below exactly as written.

---

## 1) POST /auth/otp/request

### Steps
1. In the `auth` group, click **Add Function**.
2. Name: `request-otp`
3. Add route: `POST /otp/request`
4. Set input:
   - `phone`: string

### Function logic (use Xano visual flow builder)

**Action 1: Normalize phone**
- Add action: `Transform`
- Expression: `input.phone`
- Output variable: `phone_raw`

**Action 2: Normalize to E.164**
- Add action: `Transform`
- Expression: `phone_raw`
- Regex replace: `@"\D"` -> `""`
- Output variable: `phone`

**Action 3: Count recent OTPs**
- Add action: `Query` > Table: `otp_verifications`
- Filter: `phone == phone AND created_at > now - 10 minutes`
- Return: `count`
- Output variable: `recent_count`
- Cache 5 seconds

**Action 4: Branch — too many?**
- Add action: `Branch`
- Condition: `recent_count >= 3`
  - **If yes:**
    - Add action: `Return Error`
    - Status: `429`
    - Body:
      ```
      {"error":{"code":"RATE_LIMITED","message":"Too many OTP requests. Try again in 10 minutes.","field_errors":[]}}
      ```
    - Stop flow
  - **If no:** continue

**Action 5: Generate 6-digit code**
- Add action: `Transform`
- Expression: `random.int(100000, 999999).toString()`
- Output variable: `otp_code`

**Action 6: Hash code**
- Add action: `Transform`
- Expression: `bcrypt.hash(otp_code)`
- Output variable: `code_hash`

**Action 7: Build expiry**
- Add action: `Transform`
- Expression: `now + 5 minutes`
- Output variable: `expires_at`

**Action 8: Insert OTP record**
- Add action: `Add Record`
- Table: `otp_verifications`
- Fields:
  - `phone`: `phone`
  - `code_hash`: `code_hash`
  - `purpose`: `"login"`
  - `attempts`: `0`
  - `expires_at`: `expires_at`
  - `created_at`: `now`

**Action 9: Send OTP**
- Add action: `External Request` or your SMS provider
- Method: `POST`
- URL: `{{ env.SMS_PROVIDER_URL }}`
- Headers:
  - `Authorization`: `Bearer {{ env.SMS_PROVIDER_API_KEY }}`
  - `Content-Type`: `application/json`
- Body:
  ```
  {
    "to": "{{ phone }}",
    "message": "Your PharmaConnect code is {{ otp_code }}. Valid 5 minutes."
  }
  ```
- Output variable: `sms_result`

**Action 10: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "masked_phone": "{{ phone.replaceAll(".", "*").slice(0, -4) + "****" }}",
    "cooldown_seconds": 0
  }
  ```

---

## 2) POST /auth/otp/verify

### Steps
1. Add Function: `verify-otp`
2. Route: `POST /otp/verify`
3. Input:
   - `phone`: string
   - `code`: string
   - `purpose`: string

### Function logic

**Action 1: Fetch latest OTP**
- Add action: `Query`
- Table: `otp_verifications`
- Filter:
  - `phone == input.phone`
  - `purpose == input.purpose`
  - `consumed_at == null`
  - `locked_until == null`
  - `expires_at > now`
- Sort by: `created_at desc`
- Limit: `1`
- Output variable: `otp`

**Action 2: Branch — missing OTP**
- Condition: `otp === null`
  - **If yes:** Return Error `401`
    ```
    {"error":{"code":"INVALID_OTP","message":"OTP not found or expired","field_errors":[]}}
    ```
    Stop flow.

**Action 3: Branch — locked?**
- Condition: `otp.attempts >= 5`
  - **If yes:** Return Error `401`
    ```
    {"error":{"code":"OTP_LOCKED","message":"Too many attempts. Try again later.","field_errors":[]}}
    ```
    Stop flow.

**Action 4: Verify code**
- Add action: `Transform`
- Expression: `bcrypt.compare(input.code, otp.code_hash)`
- Output variable: `code_valid`

**Action 5: Branch — wrong code**
- Condition: `code_valid == false`
  - **If yes:**
    - Add action: `Update Record`
    - Table: `otp_verifications`
    - Find by: `id == otp.id`
    - Set: `attempts = otp.attempts + 1`
    - Add action: `Branch`
    - Condition: `otp.attempts + 1 >= 5`
      - **If yes:** Set `locked_until = now + 10 minutes`
    - Return Error `401`
      ```
      {"error":{"code":"INVALID_OTP","message":"Invalid code","field_errors":[]}}
      ```
      Stop flow.

**Action 6: Success — mark consumed**
- Add action: `Update Record`
- Table: `otp_verifications`
- Find by: `id == otp.id`
- Set: `consumed_at = now`

**Action 7: Find or create user**
- Add action: `Query`
- Table: `users`
- Filter: `phone == input.phone`
- Limit: `1`
- Output variable: `user`

- Add action: `Branch`
- Condition: `user === null`
  - **If yes:**
    - Add action: `Add Record`
    - Table: `users`
    - Fields:
      - `phone`: `input.phone`
      - `role`: `"patient"`
      - `is_verified`: `true`
      - `metadata`: `{}`
      - `created_at`: `now`
      - `updated_at`: `now`
    - Output variable: `new_user`
  - **If no:**
    - Output variable: `new_user = user`

**Action 8: Create refresh token**
- Add action: `Transform`
- Expression: `uuid.v4()`
- Output variable: `refresh_token`
- Add action: `Transform`
- Expression: `bcrypt.hash(refresh_token)`
- Output variable: `refresh_hash`
- Add action: `Transform`
- Expression: `now + 30 days`
- Output variable: `refresh_expires`
- Add action: `Add Record`
- Table: `refresh_tokens`
- Fields:
  - `user_id`: `new_user.id`
  - `token_hash`: `refresh_hash`
  - `expires_at`: `refresh_expires`
  - `created_at`: `now`

**Action 9: Issue access token**
- Add action: `Transform`
- Expression: `jwt.encode({user_id: new_user.id, role: new_user.role}, "{{ env.JWT_SECRET }}", "HS256", {expiresIn: "15m"})`
- Output variable: `access_token`

**Action 10: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "access_token": "{{ access_token }}",
    "refresh_token": "{{ refresh_token }}",
    "user_id": "{{ new_user.id }}"
  }
  ```

---

## 3) POST /auth/refresh

### Steps
1. Add Function: `refresh`
2. Route: `POST /refresh`
3. Input:
   - `refresh_token`: string

### Function logic

**Action 1: Hash incoming token**
- Add action: `Transform`
- Expression: `bcrypt.hash(input.refresh_token)`
- Output variable: `token_hash`

**Action 2: Find matching token**
- Add action: `Query`
- Table: `refresh_tokens`
- Filter:
  - `token_hash == token_hash`
  - `revoked_at == null`
  - `expires_at > now`
- Limit: `1`
- Output variable: `existing`

**Action 3: Branch — invalid**
- Condition: `existing === null`
  - **If yes:** Return Error `401`
    ```
    {"error":{"code":"INVALID_REFRESH_TOKEN","message":"Refresh token invalid or expired","field_errors":[]}}
    ```
    Stop flow.

**Action 4: Revoke old token**
- Add action: `Update Record`
- Table: `refresh_tokens`
- Find by: `id == existing.id`
- Set: `revoked_at = now`

**Action 5: Create new refresh token**
- Add action: `Transform`
- Expression: `uuid.v4()`
- Output variable: `new_refresh_token`
- Add action: `Transform`
- Expression: `bcrypt.hash(new_refresh_token)`
- Output variable: `new_hash`
- Add action: `Transform`
- Expression: `now + 30 days`
- Output variable: `new_expires`
- Add action: `Add Record`
- Table: `refresh_tokens`
- Fields:
  - `user_id`: `existing.user_id`
  - `token_hash`: `new_hash`
  - `expires_at`: `new_expires`
  - `rotated_at`: `now`
  - `created_at`: `now`

**Action 6: Issue new access token**
- Add action: `Query`
- Table: `users`
- Filter: `id == existing.user_id`
- Limit: `1`
- Output variable: `user`
- Add action: `Transform`
- Expression: `jwt.encode({user_id: user.id, role: user.role}, "{{ env.JWT_SECRET }}", "HS256", {expiresIn: "15m"})`
- Output variable: `access_token`

**Action 7: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "access_token": "{{ access_token }}",
    "refresh_token": "{{ new_refresh_token }}"
  }
  ```

---

## 4) POST /auth/link

### Steps
1. Add Function: `link`
2. Route: `POST /link`
3. Input:
   - `provider`: string
   - `provider_token`: string

### Function logic

**Action 1: Verify provider token**
- Add action: `External Request`
- Example Google:
  - URL: `https://oauth2.googleapis.com/tokeninfo?id_token={{ input.provider_token }}`
- Output variable: `provider_profile`
- Add action: `Branch`
- Condition: `provider_profile.status != 200`
  - **If yes:** Return Error `401`
    ```
    {"error":{"code":"INVALID_PROVIDER_TOKEN","message":"Provider authentication failed","field_errors":[]}}
    ```
    Stop flow.

**Action 2: Find user by provider ID**
- Add action: `Query`
- Table: `users`
- Filter:
  - `metadata.provider == input.provider`
  - `metadata.provider_id == provider_profile.sub`
- Limit: `1`
- Output variable: `user`

**Action 3: Branch — create if missing**
- Condition: `user === null`
  - **If yes:**
    - Add action: `Add Record`
    - Table: `users`
    - Fields:
      - `phone`: `null`
      - `email`: `provider_profile.email || null`
      - `role`: `"patient"`
      - `is_verified`: `true`
      - `metadata`: `{provider: input.provider, provider_id: provider_profile.sub}`
      - `created_at`: `now`
      - `updated_at`: `now`
    - Output variable: `user = new_user`
  - **If no:** Continue

**Action 4: Issue access token**
- Add action: `Transform`
- Expression: `jwt.encode({user_id: user.id, role: user.role}, "{{ env.JWT_SECRET }}", "HS256", {expiresIn: "15m"})`
- Output variable: `access_token`

**Action 5: Return success**
- Add action: `Return`
- Status: `200`
- Body:
  ```
  {
    "access_token": "{{ access_token }}"
  }
  ```

---

## Required Environment Variables

Set these in Xano Environment before building:
- `SMS_PROVIDER_URL`
- `SMS_PROVIDER_API_KEY`
- `JWT_SECRET`

## Auth Middleware (recommended)

Create a reusable function `auth.middleware`:
1. Read header `Authorization`
2. Extract JWT
3. Verify signature with `env.JWT_SECRET`
4. Attach `access_token.user_id` and `access_token.role` to context
5. Return 401 if invalid

Attach this middleware to protected routes in other groups.

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| 429 on `/otp/request` | `recent_count >= 3` | Wait 10 min or increase limit |
| 401 on `/otp/verify` | `otp === null` or wrong code | Check phone format, code expiry |
| 401 on `/refresh` | `existing === null` | Token expired/revoked; re-login |
| 401 on `/link` | Provider token invalid | Verify provider config |