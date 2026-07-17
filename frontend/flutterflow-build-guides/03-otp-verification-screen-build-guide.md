# PharmaConnect — OTP Verification Screen Build Guide

**FlutterFlow build instructions for Screen 3/21**
Source of truth: `frontend/screens/03-otp-verification-screen.md`

---

## 1. App State Variables

**Menu:** Settings & Integrations → App State → + Add (if not already created from Login)

| # | Name | Type | Default | Notes |
|---|------|------|---------|-------|
| 1 | `phone_number` | String | `""` | Transferred from Login screen |
| 2 | `masked_phone` | String | `""` | Display phone from Login (e.g. +22177****4567) |
| 3 | `access_token` | String | `""` | Set after OTP verification success |
| 4 | `refresh_token` | String | `""` | Set after OTP verification success |
| 5 | `user_id` | String | `""` | Set after OTP verification success |
| 6 | `user_role` | String | `""` | Extracted from JWT payload (patient/pharmacy) |

---

## 2. Page State Variables

**Menu:** Select OtpScreen page → Page State (bottom panel) → + Add

| # | Name | Type | Default | Notes |
|---|------|------|---------|-------|
| 1 | `code` | String | `""` | Concatenated 6-digit code from all inputs |
| 2 | `code_error` | String | `""` | Error message text (e.g. "Code incorrect") |
| 3 | `is_loading` | Boolean | `false` | Shared loading guard for verify + resend |
| 4 | `resend_cooldown` | Integer | `30` | Seconds remaining before resend allowed |
| 5 | `attempts_left` | Integer | `5` | Server-side remaining attempts before block |

---

## 3. Custom Functions

**Menu:** Settings & Integrations → Custom Code → Custom Functions → + Add

### 3a. `buildCodeString`

| Property | Value |
|----------|-------|
| Name | `buildCodeString` |
| Return Type | `String` |
| Arguments | `d1: String`, `d2: String`, `d3: String`, `d4: String`, `d5: String`, `d6: String` |

**Code:**

```dart
String buildCodeString(String d1, String d2, String d3, String d4, String d5, String d6) {
  return '$d1$d2$d3$d4$d5$d6';
}
```

### 3b. `extractRoleFromToken`

| Property | Value |
|----------|-------|
| Name | `extractRoleFromToken` |
| Return Type | `String` |
| Arguments | `token: String` |

**Code:**

```dart
import 'dart:convert';

String extractRoleFromToken(String token) {
  try {
    List<String> parts = token.split('.');
    if (parts.length != 3) return '';
    String payload = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
    Map<String, dynamic> data = jsonDecode(payload);
    return data['role'] ?? '';
  } catch (e) {
    return '';
  }
}
```

### 3c. `extractAttemptsLeft`

| Property | Value |
|----------|-------|
| Name | `extractAttemptsLeft` |
| Return Type | `int` |
| Arguments | `errorBody: String` |

**Code:**

```dart
import 'dart:convert';

int extractAttemptsLeft(String errorBody) {
  try {
    Map<String, dynamic> data = jsonDecode(errorBody);
    return data['attempts_left'] ?? 5;
  } catch (e) {
    return 5;
  }
}
```

---

## 4. API Call Setup — POST /auth/otp/verify

**Menu:** Settings & Integrations → API Calls → + Add API

| Field | Value |
|-------|-------|
| **API Call Name** | `auth_otp_verify` |
| **Method** | `POST` |
| **Base URL** | Your Xano workspace URL |
| **Path** | `/auth/otp/verify` |
| **Headers** | `Content-Type: application/json` |
| **Body** | `{ "phone": "{{phone_number}}", "code": "{{code}}", "purpose": "login" }` |

**Variables tab** — define response variables:

| Variable Name | Type | JSON Path |
|---------------|------|-----------|
| `api_access_token` | String | `access_token` |
| `api_refresh_token` | String | `refresh_token` |
| `api_user_id` | String | `user_id` |
| `api_attempts_left` | Integer | `attempts_left` |

---

## 5. API Call Setup — POST /auth/otp/request (Resend)

**Menu:** Settings & Integrations → API Calls → + Add API

| Field | Value |
|-------|-------|
| **API Call Name** | `auth_otp_request` |
| **Method** | `POST` |
| **Base URL** | Your Xano workspace URL |
| **Path** | `/auth/otp/request` |
| **Headers** | `Content-Type: application/json` |
| **Body** | `{ "phone": "{{phone_number}}" }` |

**Variables tab**:

| Variable Name | Type | JSON Path |
|---------------|------|-----------|
| `api_cooldown_seconds` | Integer | `cooldown_seconds` |

---

## 6. Page Setup

**Menu:** Pages → + Add Page → Blank

| Property | Value |
|----------|-------|
| **Page Name** | `OtpScreen` |
| **Page Title** | `Vérification` |
| **Background Color** | `#FFFFFF` |
| **Page Scrollable** | Off |
| **Safe Area** | Enabled |

---

## 7. Widget Tree

```
Page (OtpScreen)
└── SingleChildScrollView
    └── Column
        ├── SizedBox (flex: 1)

        ├── Row (back button)
        │   ├── IconButton
        │   │   ├── Icon: arrow_back
        │   │   ├── Color: #0F5B6E
        │   │   └── On Tap: Navigate To → LoginScreen (type: Push, clear stack)
        │   │       └── Also: Clear App State phone_number, masked_phone

        ├── SizedBox (height: 24)

        ├── Column (header block)
        │   ├── Icon
        │   │   ├── Name: local_hospital
        │   │   ├── Size: 48
        │   │   └── Color: #0F5B6E
        │   └── Text ("PharmaConnect")
        │       ├── Value: "PharmaConnect"
        │       ├── Size: 24
        │       ├── Font Weight: bold
        │       └── Color: #0F5B6E

        ├── SizedBox (height: 32)

        ├── Text ("Vérification")
        │   ├── Value: "Vérification"
        │   ├── Size: 22
        │   ├── Font Weight: bold
        │   └── Color: #111827

        ├── SizedBox (height: 8)

        ├── Text (subtitle)
        │   ├── Value: "Un code à 6 chiffres a été envoyé au {{masked_phone}}"
        │   ├── Size: 14
        │   ├── Color: #6B7280
        │   └── Text Align: center

        ├── SizedBox (height: 32)

        ├── Row (OTP input fields)
        │   ├── Main Axis: spaceEvenly
        │   ├── Children: 6x OTP TextField widgets
        │   │
        │   │   └── TextField (otp_input_1)
        │   │       ├── Width: 48, Height: 56
        │   │       ├── Max Characters: 1
        │   │       ├── Keyboard Type: number
        │   │       ├── Text Input Action: next
        │   │       ├── Text Align: center
        │   │       ├── Font Size: 22
        │   │       ├── Font Weight: bold
        │   │       ├── Border: OutlineInputBorder
        │   │       │   ├── Border Radius: 8
        │   │       │   ├── Default Border Color: #D1D5DB
        │   │       │   ├── Focus Border Color: #0F5B6E
        │   │       │   └── Filled Border Color: #10B981 (when digit entered)
        │   │       ├── Background Color: #F9FAFB
        │   │       ├── Controller: (create FocusNode + TextEditingController per field)
        │   │       └── On Change:
        │   │           1. If text.length == 1:
        │   │              a. Set Page State `d1` = text
        │   │              b. Focus next field (otp_input_2)
        │   │              c. Check all 6 filled → auto-submit
        │   │           2. Else (text.length == 0, Backspace):
        │   │              a. Set Page State `d1` = ""
        │   │              b. Focus previous field (if not first)
        │   │
        │   │   └── TextField (otp_input_2) — same structure
        │   │       ├── On Change:
        │   │       │   1. If text.length == 1 → focus otp_input_3, check auto-submit
        │   │       │   2. If text.length == 0 → focus otp_input_1
        │   │
        │   │   └── TextField (otp_input_3) — same structure
        │   │       ├── On Change:
        │   │       │   1. If text.length == 1 → focus otp_input_4, check auto-submit
        │   │       │   2. If text.length == 0 → focus otp_input_2
        │   │
        │   │   └── TextField (otp_input_4) — same structure
        │   │       ├── On Change:
        │   │       │   1. If text.length == 1 → focus otp_input_5, check auto-submit
        │   │       │   2. If text.length == 0 → focus otp_input_3
        │   │
        │   │   └── TextField (otp_input_5) — same structure
        │   │       ├── On Change:
        │   │       │   1. If text.length == 1 → focus otp_input_6, check auto-submit
        │   │       │   2. If text.length == 0 → focus otp_input_4
        │   │
        │   │   └── TextField (otp_input_6)
        │   │       ├── Width: 48, Height: 56
        │   │       ├── Max Characters: 1
        │   │       ├── Keyboard Type: number
        │   │       ├── Text Input Action: done
        │   │       ├── Text Align: center
        │   │       ├── Font Size: 22
        │   │       ├── Font Weight: bold
        │   │       ├── Border: same styling as above
        │   │       └── On Change:
        │   │           1. If text.length == 1:
        │   │              a. Set Page State `d6` = text
        │   │              b. Check all 6 filled → auto-submit
        │   │           2. If text.length == 0 → focus otp_input_5

        ├── SizedBox (height: 4)

        ├── Text (code_error)
        │   ├── Value: "{{code_error}}"
        │   ├── Size: 14
        │   ├── Color: #DC2626
        │   ├── Text Align: center
        │   └── Visible only when: `code_error != ""`

        ├── SizedBox (height: 16)

        ├── Button ("Vérifier")
        │   ├── Type: Elevated Button
        │   ├── Background Color: #0F5B6E
        │   ├── Text Color: #FFFFFF
        │   ├── Font Size: 16
        │   ├── Width: fill (margin left/right: 24)
        │   ├── Height: 48
        │   ├── Disabled: `code.length < 6 || is_loading`
        │   ├── When loading: Show CircularProgressIndicator inside button
        │   │   └── Size: 20, Color: #FFFFFF
        │   └── On Tap:
        │       1. If `is_loading == true` → stop (guard)
        │       2. Set `is_loading = true`
        │       3. Set `code = buildCodeString(d1, d2, d3, d4, d5, d6)`
        │       4. Call API `auth_otp_verify` with body `{"phone": phone_number, "code": code, "purpose": "login"}`
        │          ├── Success (200):
        │          │   1. Set App State `access_token = api_access_token`
        │          │   2. Set App State `refresh_token = api_refresh_token`
        │          │   3. Set App State `user_id = api_user_id`
        │          │   4. Call Custom Function `extractRoleFromToken(api_access_token)` → store as `role`
        │          │   5. Set App State `user_role = role`
        │          │   6. Store tokens in Secure Storage:
        │          │      ├── Key: `access_token`, Value: `api_access_token`
        │          │      ├── Key: `refresh_token`, Value: `api_refresh_token`
        │          │      └── Key: `user_id`, Value: `api_user_id`
        │          │   7. If `role == "patient"`:
        │          │      ├── Navigate To → HomeScreen (type: Push, clear stack)
        │          │      └── Pass: access_token, refresh_token, user_id
        │          │   8. If `role == "pharmacy"`:
        │          │      ├── Navigate To → PharmacyDashboardScreen (type: Push, clear stack)
        │          │      └── Pass: access_token, refresh_token, user_id
        │          │   9. Set `is_loading = false`
        │          │
        │          ├── Invalid Code (401):
        │          │   1. Set `code_error = "Code incorrect. Réessayez."`
        │          │   2. Clear all 6 OTP input fields (d1-d6 = "")
        │          │   3. Focus first OTP input (otp_input_1)
        │          │   4. Set `is_loading = false`
        │          │   5. Decrement `attempts_left` by 1 (or set from `api_attempts_left`)
        │          │   6. If `attempts_left == 0`:
        │          │      ├── Show AlertDialog: "Trop de tentatives. Veuillez redemander un code."
        │          │      └── Navigate To → LoginScreen (type: Push, clear stack)
        │          │         └── Clear App State: access_token, refresh_token, user_id, phone_number
        │          │
        │          ├── Rate Limited (429):
        │          │   1. Parse `retry_after_seconds` from response
        │          │   2. Set `code_error = "Trop de tentatives. Réessayez dans ${retry_after} minutes."`
        │          │   3. Set `resend_cooldown = retry_after_seconds`
        │          │   4. Start Timer.periodic (1s):
        │          │      ├── Decrement `resend_cooldown` by 1
        │          │      └── When `resend_cooldown == 0`: stop timer
        │          │   5. Set `is_loading = false`
        │          │
        │          └── Network Error (no response / timeout):
        │              1. Set `code_error = "Erreur réseau. Vérifiez votre connexion."`
        │              2. Set `is_loading = false`
        │              3. OTP input values are preserved (do not clear)

        ├── SizedBox (height: 24)

        ├── Text (resend text)
        │   ├── Value: When `resend_cooldown > 0`:
        │   │        "Renvoyer le code dans {{resend_cooldown}}s"
        │   │      When `resend_cooldown == 0`:
        │   │        "Renvoyer le code"
        │   ├── Size: 14
        │   ├── Color: When `resend_cooldown > 0`: #9CA3AF (grey, not tappable)
        │   │         When `resend_cooldown == 0`: #0F5B6E (blue, tappable)
        │   └── On Tap (only when `resend_cooldown == 0 && !is_loading`):
        │       1. Set `is_loading = true`
        │       2. Call API `auth_otp_request` with body `{"phone": phone_number}`
        │          ├── Success (200):
        │          │   1. Set `resend_cooldown = 30` (or `api_cooldown_seconds`)
        │          │   2. Start Timer.periodic (1s):
        │          │      ├── Decrement `resend_cooldown` by 1 each tick
        │          │      └── When `resend_cooldown == 0`: stop timer
        │          │   3. Clear OTP inputs (d1-d6 = "")
        │          │   4. Focus first OTP input (otp_input_1)
        │          │   5. Clear `code_error`
        │          │   6. Set `attempts_left = 5`
        │          │   7. Set `is_loading = false`
        │          ├── Rate Limited (429):
        │          │   1. Set `code_error = "Trop de tentatives. Réessayez dans quelques minutes."`
        │          │   2. Set `is_loading = false`
        │          └── Network Error:
        │              1. Set `code_error = "Erreur réseau. Vérifiez votre connexion."`
        │              2. Set `is_loading = false`

        ├── SizedBox (flex: 1)
```

---

## 8. OTP Input Behaviour — Detailed Implementation

### 8a. Auto-advance

On each TextField's **On Change** action (when new character entered):

1. Check `widget.text.length == 1` (new digit)
2. Update corresponding Page State variable (d1-d6)
3. Call `FocusScope.of(context).requestFocus(nextFocusNode)` to move to next TextField
4. After updating field 6, check if all 6 digits are filled → trigger auto-submit

### 8b. Backspace Handling

On each TextField's **On Change** action (when character deleted):

1. Check `widget.text.length == 0` (field cleared)
2. Clear the corresponding Page State variable (d1-d6)
3. Call `FocusScope.of(context).requestFocus(prevFocusNode)` to move to previous TextField
4. For the first field: do not move focus (already at start)

### 8c. Paste Support

On the first OTP TextField (otp_input_1), add an **On Paste** handler:

1. Get clipboard text
2. Strip all non-digit characters
3. Check `length == 6` exactly
4. If valid: split into 6 chars, set d1-d6, fill all TextField controllers, and auto-submit
5. If invalid (length != 6): ignore paste, keep fields empty

**Menu:** Select otp_input_1 → Properties → On Paste (requires custom code wrapper or use a paste-detection widget)

Alternative: Add a hidden TextField that accepts multiline paste, then distribute its value across the 6 visible inputs.

### 8d. Auto-submit Trigger

After all 6 digits are entered (either by typing, paste, or backspace-navigation):

1. Build full code: `d1 + d2 + d3 + d4 + d5 + d6`
2. Set Page State `code = concatenated_code`
3. If `code.length == 6 && !is_loading`:
   - Execute the same verify action chain as the "Vérifier" button On Tap

### 8e. Visual Feedback — Border Color

On each TextField, configure **OutlineInputBorder**:

| State | Border Color | Condition |
|-------|-------------|-----------|
| Default (empty, unfocused) | `#D1D5DB` | TextField has no focus, no value |
| Focused (empty) | `#0F5B6E` | TextField has focus, no value |
| Filled (unfocused) | `#10B981` | TextField has value, no focus |
| Focused (filled) | `#0F5B6E` | TextField has focus and value |
| Error | `#DC2626` | `code_error != ""` (show error border on all 6 inputs) |

---

## 9. Page Actions (On Page Load)

**Menu:** Select page → Properties → Actions → On Page Load

| Step | Action | Details |
|------|--------|---------|
| 1 | Set Page State | `resend_cooldown = 30` |
| 2 | Start Timer.periodic (1s) | Decrement `resend_cooldown` by 1 each tick |
| 3 | Set Widget Focus | Focus `otp_input_1` (first OTP field) to open numeric keyboard |
| 4 | Set Page State | `attempts_left = 5` |

**Timer setup (On Page Load):**

```
Timer.periodic(Duration(seconds: 1), (timer) {
  if (resend_cooldown > 0) {
    setState(() => resend_cooldown--);
  } else {
    timer.cancel();
  }
});
```

In FlutterFlow: Use **Timer Widget** (Community) or create a **Custom Action** for the periodic timer.

---

## 10. Custom Action — Resend Timer

**Menu:** Settings & Integrations → Custom Code → Custom Actions → + Add

| Property | Value |
|----------|-------|
| Name | `startResendCooldown` |
| Return Type | `void` |
| Arguments | `initialSeconds: Integer` |

**Code:**

```dart
import 'dart:async';

Timer? _resendTimer;

Future<void> startResendCooldown(int initialSeconds) async {
  _resendTimer?.cancel();
  int remaining = initialSeconds;
  
  _resendTimer = Timer.periodic(Duration(seconds: 1), (timer) {
    FFAppState().resendCooldown = remaining;
    if (remaining <= 0) {
      timer.cancel();
      _resendTimer = null;
    }
    remaining--;
  });
}
```

---

## 11. Secure Storage Setup

**Menu:** Settings & Integrations → Custom Code → Dependencies → + Add

| Package | Version |
|---------|---------|
| `flutter_secure_storage` | `^9.0.0` |

**Menu:** Settings & Integrations → Custom Code → Custom Actions → + Add

### 11a. `storeSecureTokens`

| Property | Value |
|----------|-------|
| Name | `storeSecureTokens` |
| Return Type | `void` |
| Arguments | `accessToken: String`, `refreshToken: String`, `userId: String` |

**Code:**

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final FlutterSecureStorage _storage = FlutterSecureStorage();

Future<void> storeSecureTokens(
  String accessToken,
  String refreshToken,
  String userId,
) async {
  await Future.wait([
    _storage.write(key: 'access_token', value: accessToken),
    _storage.write(key: 'refresh_token', value: refreshToken),
    _storage.write(key: 'user_id', value: userId),
  ]);
}
```

### 11b. `clearSecureTokens`

| Property | Value |
|----------|-------|
| Name | `clearSecureTokens` |
| Return Type | `void` |
| Arguments | none |

**Code:**

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final FlutterSecureStorage _storage = FlutterSecureStorage();

Future<void> clearSecureTokens() async {
  await Future.wait([
    _storage.delete(key: 'access_token'),
    _storage.delete(key: 'refresh_token'),
    _storage.delete(key: 'user_id'),
  ]);
}
```

---

## 12. Navigation Targets

| Trigger | Destination | Data Passed | Stack Action |
|---------|-------------|-------------|-------------|
| ← Back tap | LoginScreen | None | Push (clear stack) |
| Verify success + role=patient | HomeScreen | access_token, refresh_token, user_id | Push (clear stack) |
| Verify success + role=pharmacy | PharmacyDashboardScreen | access_token, refresh_token, user_id | Push (clear stack) |
| 5 failed attempts | LoginScreen | None | Push (clear stack) — clear tokens |

---

## 13. Error Handling Matrix

| Scenario | Detection | UI Response | Data Action |
|----------|-----------|-------------|-------------|
| Invalid code (401) | API status 401 | Show "Code incorrect. Réessayez." in red | Clear all 6 inputs, focus field 1, decrement attempts_left |
| Max attempts (attempts_left == 0) | attempts_left counter | Show AlertDialog "Trop de tentatives." | Navigate to LoginScreen, clear all auth tokens |
| Rate limited (429) | API status 429 | Show retry_after message | Start cooldown timer, disable resend |
| Network error | Connection timeout / no response | Show "Erreur réseau." | Preserve OTP inputs for retry |
| Multi-tap | is_loading guard | Button disabled | Only one API call in flight |

The shared `is_loading` guard prevents concurrent API calls for both verify and resend operations. Set `is_loading = true` before any API call; set `is_loading = false` in every terminal branch (success, error, network failure).

---

## 14. Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| User types 6 digits and verify fails | Error shown, 6 digits preserved in inputs, focus on input 1 |
| User pastes 6-digit code | All 6 fields filled, auto-submit triggered |
| User pastes code != 6 digits | Paste ignored, fields remain empty |
| Rate limit on resend | Show "Trop de tentatives. Réessayez dans X minutes." |
| App killed during verify | Next splash — refresh token not stored → redirect to LoginScreen |
| Multi-tap "Vérifier" | Button disabled immediately, single API call only |
| User taps ← Back | Navigate to LoginScreen, no persistent OTP state |
| Timer tick during loading | Cooldown countdown continues in background |
| Paste with spaces or dashes | Strip all non-digits before checking length == 6 |

---

## 15. Dependencies

**Menu:** Settings & Integrations → Custom Code → Dependencies → + Add

| Package | Version | Purpose |
|---------|---------|---------|
| `flutter_secure_storage` | `^9.0.0` | Token persistence |
| `http` | `^1.0.0` | API calls (or use FlutterFlow built-in API) |

---

## 16. Test Checklist

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1 | Display masked phone | Navigate from Login | Shows "Un code a été envoyé au +22177****4567" |
| 2 | Auto-advance on type | Type "123456" one digit per field | Focus moves to next field after each digit |
| 3 | Backspace navigation | Tap backspace on field 6 | Focus moves to field 5, value cleared |
| 4 | Backspace on field 1 | Tap backspace on field 1 | Value cleared, focus stays on field 1 |
| 5 | Paste 6-digit code | Copy "456789", paste into field 1 | All 6 fields fill, auto-submit fires |
| 6 | Paste invalid code (7 digits) | Copy "1234567", paste | Nothing happens, all fields empty |
| 7 | Paste with dashes | Copy "123-456", paste | Strips dash, fills 6 fields, auto-submit |
| 8 | Auto-submit on 6th digit | Type digits 1-6 quickly | Verify API called automatically on 6th entry |
| 9 | Auto-submit on paste | Paste valid 6-digit code | Verify API called automatically |
| 10 | Invalid code (401) | Submit wrong code | Red error shown, inputs cleared, focus field 1 |
| 11 | Attempts countdown | Submit wrong code 5 times | On 5th failure → AlertDialog → redirect to Login |
| 12 | Rate limited (429) on verify | Submit codes rapidly | Shows retry message, cooldown starts |
| 13 | Network error | Airplane mode → tap Vérifier | Shows "Erreur réseau", inputs preserved |
| 14 | Resend cooldown UI | Navigate to screen | Shows "Renvoyer dans 30s", grey, not tappable |
| 15 | Resend cooldown expires | Wait 30 seconds | Shows "Renvoyer le code", blue, tappable |
| 16 | Tap "Renvoyer" | Tap resend link | Clears inputs, calls OTP request, resets cooldown |
| 17 | Verify success → patient | Submit valid code, role=patient | Tokens stored in App State + Secure Storage, navigates to HomeScreen |
| 18 | Verify success → pharmacy | Submit valid code, role=pharmacy | Tokens stored, navigates to PharmacyDashboardScreen |
| 19 | Tokens in Secure Storage | After verify success | access_token, refresh_token, user_id all persisted |
| 20 | ← Back to Login | Tap back arrow | Navigates to LoginScreen, OTP state discarded |
| 21 | Multi-tap prevention | Tap Vérifier rapidly | Single API call, button disabled by is_loading |
| 22 | is_loading shared guard | Tap Vérifier, then tap Renvoyer | Renvoyer disabled while verify in progress |
| 23 | Visual feedback — empty | Initial state | All inputs grey border (#D1D5DB) |
| 24 | Visual feedback — focused | Tap an input field | Border turns teal (#0F5B6E) |
| 25 | Visual feedback — filled | Type a digit | Border turns green (#10B981) |
| 26 | Visual feedback — error state | Submit invalid code | Input borders turn red (#DC2626) |
| 27 | Keyboard type | Tap any input | Numeric keypad opens |
| 28 | Error cleared on new input | Error shown → type new digit | Error disappears |
| 29 | Page load timer start | Screen opens | Timer starts at 30, counts down every second |
| 30 | Timer persists on error | Submit wrong code | Timer continues counting, resend still available |