# PharmaConnect — Login Screen Build Guide

**FlutterFlow build instructions for Screen 2/21**
Source of truth: `frontend/screens/02-login-screen.md`

---

## 1. App State Variables

**Menu:** Settings & Integrations → App State → + Add

| # | Name | Type | Default | Notes |
|---|------|------|---------|-------|
| 1 | `phone_number` | String | `""` | Normalized E.164 phone, set after successful OTP request |
| 2 | `masked_phone` | String | `""` | Masked display phone from API response (e.g. +22177****4567) |
| 3 | `cooldown_seconds` | Integer | `0` | Server cooldown from API response |

---

## 2. Page State Variables

**Menu:** Select LoginScreen page → Page State (bottom panel) → + Add

| # | Name | Type | Default | Notes |
|---|------|------|---------|-------|
| 1 | `phone_input` | String | `""` | Raw text as user types |
| 2 | `phone_error` | String | `""` | Validation error message text |
| 3 | `is_phone_valid` | Boolean | `false` | Set by validatePhone() on each keystroke |
| 4 | `is_loading` | Boolean | `false` | True during API call, disables button |
| 5 | `global_error` | String | `""` | API error message (rate-limit, network) |
| 6 | `local_cooldown` | Integer | `0` | Local countdown seconds for rate-limit UX |

---

## 3. Custom Functions

**Menu:** Settings & Integrations → Custom Code → Custom Functions → + Add

### 3a. `normalizePhone`

| Property | Value |
|----------|-------|
| Name | `normalizePhone` |
| Return Type | `String` |
| Arguments | `input: String` |

**Code:**

```dart
String normalizePhone(String input) {
  String digits = input.replaceAll(RegExp(r'\D'), '');
  if (digits.length == 12 && digits.startsWith('221')) return '+$digits';
  if (digits.length == 9) return '+221$digits';
  return '';
}
```

### 3b. `validatePhone`

| Property | Value |
|----------|-------|
| Name | `validatePhone` |
| Return Type | `Map<String, dynamic>` |
| Arguments | `input: String` |

**Code:**

```dart
String normalizePhone(String input) {
  String digits = input.replaceAll(RegExp(r'\D'), '');
  if (digits.length == 12 && digits.startsWith('221')) return '+$digits';
  if (digits.length == 9) return '+221$digits';
  return '';
}

Map<String, dynamic> validatePhone(String input) {
  String normalized = normalizePhone(input);
  if (normalized.length == 13 && normalized.startsWith('+221')) {
    return {
      'is_valid': true,
      'phone': normalized,
      'error': ''
    };
  }
  return {
    'is_valid': false,
    'phone': '',
    'error': 'Numéro invalide. Format: 771234567 ou +221771234567'
  };
}
```

---

## 4. API Call Setup

**Menu:** Settings & Integrations → API Calls → + Add API

| Field | Value |
|-------|-------|
| **API Call Name** | `auth_request_otp` |
| **Method** | `POST` |
| **Base URL** | Your Xano workspace URL |
| **Path** | `/auth/otp/request` |
| **Headers** | `Content-Type: application/json` |
| **Body** | `{ "phone": "{{normalized_phone}}" }` |

**Variables tab** — define response variables:

| Variable Name | Type | JSON Path |
|---------------|------|-----------|
| `api_masked_phone` | String | `masked_phone` |
| `api_cooldown_seconds` | Integer | `cooldown_seconds` |

---

## 5. Custom Action (Optional — for analytics)

**Menu:** Settings & Integrations → Custom Code → Custom Actions → + Add

| Property | Value |
|----------|-------|
| Name | `logAnalyticsEvent` |
| Return Type | `void` |
| Arguments | `eventName: String`, `eventData: Map<String, dynamic>` |

**Code:**

```dart
import 'package:firebase_analytics/firebase_analytics.dart';

Future<void> logAnalyticsEvent(
  String eventName,
  Map<String, dynamic> eventData,
) async {
  await FirebaseAnalytics.instance.logEvent(
    name: eventName,
    parameters: eventData,
  );
}
```

*Skip this step if not using Firebase Analytics. Remove analytics action steps from the page actions below if analytics is not configured.*

---

## 6. Page Setup

**Menu:** Pages → + Add Page → Blank

| Property | Value |
|----------|-------|
| **Page Name** | `LoginScreen` |
| **Page Title** | `Connexion` |
| **Background Color** | `#FFFFFF` |
| **Page Scrollable** | Off |
| **Safe Area** | Enabled |

---

## 7. Widget Tree

Build this exact hierarchy:

```
Page (LoginScreen)
└── SingleChildScrollView
    └── Column
        ├── SizedBox (spacer, flex: 1)

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

        ├── Text ("Connectez-vous")
        │   ├── Value: "Connectez-vous"
        │   ├── Size: 22
        │   ├── Font Weight: bold
        │   └── Color: #111827

        ├── SizedBox (height: 8)

        ├── Text (subtitle)
        │   ├── Value: "Entrez votre numéro de téléphone pour recevoir un code de vérification"
        │   ├── Size: 14
        │   └── Color: #6B7280
        │   └── Text Align: center

        ├── SizedBox (height: 24)

        ├── Container (phone input wrapper)
        │   ├── Width: fill (or fixed 360)
        │   ├── Border Radius: 8
        │   ├── Border Color: #D1D5DB (changes to #0F5B6E on focus)
        │   ├── Padding: 12
        │   └── Child: Row
        │       ├── Text ("+221")
        │       │   ├── Size: 16
        │       │   └── Color: #111827
        │       ├── Text (" | ")
        │       │   └── Color: #D1D5DB
        │       └── TextField (phone input)
        │           ├── Controller: Page State `phone_input`
        │           ├── Hint Text: "77 123 45 67"
        │           ├── Keyboard Type: phone
        │           ├── Text Input Action: done
        │           ├── Autofocus: true
        │           ├── Max Characters: 12 (allows +221... but strips to 9 digits)
        │           └── On Change:
        │               ├── Call Custom Function `validatePhone(phone_input)`
        │               ├── Store result in Page State
        │               │   ├── is_phone_valid = result['is_valid']
        │               │   └── phone_error = result['error']
        │               └── Format display: insert spaces every 2 digits after 2

        ├── SizedBox (height: 4)

        ├── Text (phone_error)
        │   ├── Value: "{{phone_error}}"
        │   ├── Size: 12
        │   ├── Color: #DC2626
        │   └── Visible only when: `phone_error != ""`

        ├── SizedBox (height: 16)

        ├── Text (global_error)
        │   ├── Value: "{{global_error}}"
        │   ├── Size: 14
        │   ├── Color: #DC2626
        │   └── Visible only when: `global_error != ""`

        ├── Text (local_cooldown display)
        │   ├── Value: "Réessayez dans {{local_cooldown}}s"
        │   ├── Size: 14
        │   ├── Color: #DC2626
        │   └── Visible only when: `local_cooldown > 0`

        ├── SizedBox (height: 24)

        ├── Button ("Envoyer le code")
        │   ├── Type: Elevated Button
        │   ├── Background Color: #0F5B6E
        │   ├── Text Color: #FFFFFF
        │   ├── Size: 16
        │   ├── Width: fill
        │   ├── Height: 48
        │   ├── Disabled: `!is_phone_valid || is_loading || local_cooldown > 0`
        │   ├── When loading: Show CircularProgressIndicator inside button
        │   │   └── Size: 20, Color: #FFFFFF
        │   └── On Tap:
        │       1. Set `is_loading = true`
        │       2. Run `normalizePhone(phone_input)` → store as `normalized_phone`
        │       3. **Analytics (optional):** logAnalyticsEvent("otp_requested", {"phone": normalized_phone})
        │       4. Call API `auth_request_otp` with body `{"phone": normalized_phone}`
        │          ├── Success (200):
        │          │   1. Set App State `phone_number = normalized_phone`
        │          │   2. Set App State `masked_phone = api_masked_phone`
        │          │   3. Set App State `cooldown_seconds = api_cooldown_seconds`
        │          │   4. **Analytics (optional):** logAnalyticsEvent("otp_success", {"phone": masked_phone})
        │          │   5. Navigate To → OtpScreen
        │          │      ├── Page: OtpScreen
        │          │      └── Type: Push
        │          ├── Rate Limited (429):
        │          │   1. Parse `error.retry_after_seconds` from response
        │          │   2. Set `global_error = "Trop de tentatives. Réessayez dans ${retry_after} minutes."`
        │          │   3. Set `local_cooldown = retry_after_seconds`
        │          │   4. Start Timer.periodic (1 second):
        │          │      ├── Decrement `local_cooldown` by 1 each tick
        │          │      └── When `local_cooldown == 0`: set `is_loading = false`, clear `global_error`, stop timer
        │          │   5. **Analytics (optional):** logAnalyticsEvent("otp_rate_limited", {"phone": phone_input, "retry_after": retry_after_seconds})
        │          └── Error / Network failure:
        │              1. Set `global_error = "Erreur réseau. Vérifiez votre connexion."`
        │              2. Set `is_loading = false`
        │              3. **Analytics (optional):** logAnalyticsEvent("otp_network_error", {"phone": phone_input})

        ├── SizedBox (height: 32)

        ├── Text ("Connexion pharmacie ?")
        │   ├── Size: 14
        │   ├── Color: #0F5B6E
        │   ├── On Tap: Navigate To → PharmacyLoginScreen (future screen)
        │   └── Alignment: center

        ├── SizedBox (spacer, flex: 1)

        └── Column (legal footer)
            ├── InkWell (Conditions d'utilisation)
            │   ├── Text: "Conditions d'utilisation"
            │   ├── Size: 11
            │   ├── Color: #9CA3AF
            │   └── On Tap: Open URL → https://pharmaconnect.example/terms
            └── InkWell (Politique de confidentialité)
                ├── Text: "Politique de confidentialité"
                ├── Size: 11
                ├── Color: #9CA3AF
                └── On Tap: Open URL → https://pharmaconnect.example/privacy
```

---

## 8. Keyboard Submit Action

On the TextField's **On Submit** action (triggered when keyboard "done"/"→" is tapped):

| Condition | Action |
|-----------|--------|
| `is_phone_valid == true && is_loading == false && local_cooldown == 0` | Execute the same action chain as button On Tap (step 7 above) |
| Otherwise | Do nothing (phone is invalid or loading) |

---

## 9. Page Actions (On Page Load)

**Menu:** Select page → Properties → Actions → On Page Load

| Step | Action | Details |
|------|--------|---------|
| 1 | Set Widget Focus | Focus the phone TextField (triggers autofocus) |

---

## 10. Input Formatting (Display Mask)

On TextField **On Change**, add a formatting step before updating `phone_input`:

Strip all non-digits from raw input. If `length > 9`, truncate to 9. Then format display:

```
771234567 → "77 123 45 67"
```

This is a display-only mask. The `phone_input` Page State variable stores only the raw 9 digits.

---

## 11. Navigation Targets

| Trigger | Destination | Data Passed |
|---------|-------------|-------------|
| OTP request success | `OtpScreen` | `phone_number` (App State), `masked_phone` (App State), `cooldown_seconds` (App State) |
| Tap "Connexion pharmacie" | `PharmacyLoginScreen` | None (future screen) |
| Tap legal link | External browser | URL constant |

---

## 12. Dependencies

**Menu:** Settings & Integrations → Custom Code → Dependencies → + Add

| Package | Version |
|---------|---------|
| `firebase_analytics` | `^11.0.0` (optional, only if using analytics) |

---

## 13. Test Checklist

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1 | Enter "771234567" | Type 9 digits | Normalized to +221771234567, button enables |
| 2 | Enter "+22177123456" | Type 12 digit format | Same result: +221771234567, button enables |
| 3 | Enter "123" (<9 digits) | Type 3 digits | Button stays disabled, error shows |
| 4 | Enter letters "abc" | Type letters | Stripped, nothing appears |
| 5 | Paste phone number | Paste 771234567 | Strips non-digits, formats, validates |
| 6 | Tap "Envoyer" | Valid phone → tap | Button disables, spinner appears, API called |
| 7 | OTP request success (200) | Valid response | Navigates to OtpScreen with phone, masked_phone, cooldown_seconds |
| 8 | Rate limited (429) | API returns 429 | Shows error, starts cooldown timer, button disabled |
| 9 | Cooldown expires | Wait for timer | Timer hits 0, button re-enables, error clears |
| 10 | Network error | Airplane mode → tap | Shows "Erreur réseau", button re-enables immediately |
| 11 | Keyboard submit | Valid phone → tap "Done" | Same as button tap, triggers API call |
| 12 | Autofocus | Page loads | Phone input has focus, keyboard opens |
| 13 | Phone keyboard type | Page loads | Keyboard shows numeric digits with phone layout |
| 14 | Multi-tap prevention | Tap button rapidly | Only one API call (is_loading disables button) |
| 15 | Tap "Connexion pharmacie" | Tap link | Navigates to PharmacyLoginScreen |
| 16 | Tap legal link | Tap "Conditions" | Opens external browser with URL |
| 17 | Analytics (if configured) | All API events | Events logged at correct points |
| 18 | Display formatting | Type 771234567 | Shows "77 123 45 67" in input field |