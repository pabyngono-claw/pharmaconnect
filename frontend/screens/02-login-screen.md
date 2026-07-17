# PharmaConnect — Écran 2/21 : Login (Phone Input)

**Phase 1 — Patient**

---

## 1. UI Layout

```
┌─────────────────────────────────────┐
│                                     │
│         🏥 PharmaConnect           │  ← Logo centré, 24px bold, #0F5B6E
│                                     │
│   Connectez-vous                    │  ← Titre 22px bold #111827
│                                     │
│   Entrez votre numéro de            │
│   téléphone pour recevoir un        │  ← Sous-titre 14px #6B7280
│   code de vérification              │
│                                     │
│   ┌──────────────────────────┐      │
│   │   +221 |  ▏              │      │  ← Phone input, keyboard=phone, autofocus=true
│   │         77 123 45 67     │      │
│   └──────────────────────────┘      │
│                                     │
│   [      Envoyer le code       ]    │  ← Primary button #0F5B6E
│                                     │    disabled si invalide ou loading
│                                     │
│   Connexion pharmacie ? →           │  ← Lien #0F5B6E 14px
│                                     │
│   En continuant vous acceptez       │
│   les Conditions d'utilisation      │  ← Liens légaux 11px #9CA3AF
│   et la Politique de confidentialité│
└─────────────────────────────────────┘
```

**Couleurs** : Fond `#FFFFFF`, titre `#111827`, primaire `#0F5B6E`, erreur `#DC2626`, bord input `#D1D5DB` → `#0F5B6E` (focus).

---

## 2. Variables

### App State

| Nom | Type | Default | Notes |
|-----|------|---------|-------|
| `phone_number` | String | "" | Numéro normalisé E.164, stocké après submit |
| `masked_phone` | String | "" | Retourné par /auth/otp/request |
| `cooldown_seconds` | Int | 0 | Retourné par /auth/otp/request |

### Page State

| Nom | Type | Default | Notes |
|-----|------|---------|-------|
| `phone_input` | String | "" | Texte brut saisi |
| `phone_error` | String | "" | Message d'erreur validation |
| `is_phone_valid` | Bool | false | Validé par Custom Function |
| `is_loading` | Bool | false | Pendant l'appel API, bouton désactivé |
| `global_error` | String | "" | Erreur API/réseau |

---

## 3. Improvements Applied

### #1 — Disable OTP button immediately on first tap

Set `is_loading = true` immediately on button press, before any API call. Button is disabled when `is_loading` or `!is_phone_valid`. Re-enabled on API error/rate-limit.

### #2 — Accept both 771234567 and +221771234567, normalize to +221771234567

**Custom Function** `normalizePhone(input: String) → String`:

```dart
import 'dart:convert';

String normalizePhone(String input) {
  // Strip all non-digit characters
  String digits = input.replaceAll(RegExp(r'\D'), '');

  // If starts with 221 and has 12 digits: +221771234567
  if (digits.length == 12 && digits.startsWith('221')) {
    return '+$digits';
  }

  // If exactly 9 digits (local format): prepend +221
  if (digits.length == 9) {
    return '+221$digits';
  }

  // Invalid — return empty to signal failure
  return '';
}
```

### #3 — Reusable Custom Function for validation

**Custom Function** `validatePhone(input: String) → Map`:

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

Used on every keystroke via `onChanged` to set `is_phone_valid` and `phone_error`.

### #4 — Re-enable button when cooldown reaches zero

When `cooldown_seconds > 0`, show countdown: "Réessayez dans Xs". Use a Timer.periodic (1s) that decrements the value. When it hits 0, set `is_loading = false` and re-enable the button. FlutterFlow Timer widget handles this natively.

### #5 — Phone keyboard, autofocus, keyboard submit

- Input type: `Phone number` (keyboard shows digits)
- Autofocus: `true` on page load (after splash transition delay)
- Text input action: `done` (keyboard shows "Go" / "Done" / "→" button)
- On submit action: if `is_phone_valid`, trigger the API call (same as button tap)

### #6 — Optional analytics events

| Event | Trigger | Data |
|-------|---------|------|
| `otp_requested` | Button tap, before API call | `{ phone: masked_phone }` |
| `otp_success` | API 200 response | `{ phone: masked_phone }` |
| `otp_rate_limited` | API 429 response | `{ phone, retry_after_seconds }` |
| `otp_network_error` | Network failure | `{ phone }` |

Implementation depends on your analytics provider (Firebase Analytics, Mixpanel, etc.). In FlutterFlow, add a Custom Action or API Logger that fires on each event.

---

## 4. API Call — POST /auth/otp/request

| Propriété | Valeur |
|-----------|--------|
| **Method** | POST |
| **URL** | `{base_url}/auth/otp/request` |
| **Headers** | `Content-Type: application/json` |
| **Body** | `{ "phone": "{{normalized_phone}}" }` |

**Success (200)** : Store `masked_phone`, `cooldown_seconds` in App State → navigate to OTP Screen.

**Rate Limited (429)** : Show "Trop de tentatives. Réessayez dans X minutes." Start countdown timer, disable button.

**Error (4xx/5xx)** : Show "Erreur. Vérifiez votre numéro et réessayez." Re-enable button.

**Network error** : Show "Erreur réseau. Vérifiez votre connexion." Re-enable button.

---

## 5. Transitions

| Action | Destination | Data |
|--------|-------------|------|
| Tap "Envoyer" → success | OTP Screen | `phone`, `masked_phone`, `cooldown_seconds` |
| Tap "Connexion pharmacie" | Pharmacy Login | — |
| Tap legal links | External browser | URL |

---

## 6. Test Checklist

- [ ] Both 771234567 and +221771234567 accepted, normalized to +221771234567
- [ ] Button disabled on first tap, re-enabled on error
- [ ] Countdown timer appears on 429, button re-enabled when timer hits 0
- [ ] Phone keyboard on focus, autofocus on page load
- [ ] Keyboard "done" button submits when valid
- [ ] Button disabled while loading, shows spinner + "Envoi..."
- [ ] Analytics events fire at correct points (optional)
- [ ] Formatting: 77 123 45 67 on 9 digits
- [ ] Non-digit characters stripped automatically