# PharmaConnect — Écran 3/21 : OTP Verification

**Phase 1 — Patient**

---

## 1. UI Layout

```
┌─────────────────────────────────┐
│                                 │
│  ← Retour                       │  ← Back to Login, efface cooldown
│                                 │
│         🏥                     │
│    PharmaConnect                │
│                                 │
│   Vérification                  │  ← Titre 22px bold #111827
│                                 │
│   Un code à 6 chiffres a été    │
│   envoyé au +22177****4567      │  ← masked_phone, 14px #6B7280
│                                 │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│   │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │  ← 6 inputs individuels, centrés
│   └───┘ └───┘ └───┘ └───┘ └───┘ └───┘  ← focus auto-advance, dernier auto-submit
│                                 │
│   Code incorrect. Réessayez.     │  ← Erreur si 401, rouge #DC2626, 14px
│                                 │
│   [         Vérifier         ]  │  ← Bouton primaire, disabled si < 6 chiffres
│                                 │
│   Renvoyer le code dans 2:30    │  ← Cooldown timer, ou "Renvoyer le code" cliquable
│                                 │
└─────────────────────────────────┘
```

**Couleurs** : Fond `#FFFFFF`, titre `#111827`, primaire `#0F5B6E`, erreur `#DC2626`, lien `#0F5B6E`, bord input `#D1D5DB` → `#0F5B6E` (focus) → `#10B981` (vert rempli).

---

## 2. Variables

### App State (déjà créées à l'écran Login)

| Nom | Type | Source |
|-----|------|--------|
| `phone_number` | String | Transféré depuis Login |
| `masked_phone` | String | Transféré depuis Login |
| `access_token` | String | Stocké après verify success |
| `refresh_token` | String | Stocké après verify success |
| `user_id` | String | Stocké après verify success |
| `user_role` | String | Stocké après verify success |

### Page State

| Nom | Type | Default | Notes |
|-----|------|---------|-------|
| `code` | String | "" | Concatenation des 6 inputs |
| `code_error` | String | "" | "Code incorrect" si 401 |
| `is_loading` | Bool | false | Pendant verify |
| `resend_cooldown` | Int | 30 | Secondes restantes avant renvoi |
| `attempts_left` | Int | 5 | Tentatives restantes avant blocage |

---

## 3. OTP Input Behaviour

Six individual `TextField` widgets, each max 1 digit, keyboard type `number`:

- **Auto-advance** : après saisie du chiffre N, focus passe à l'input N+1.
- **Auto-remove** : si l'utilisateur efface un chiffre (Backspace), focus recule à l'input précédent.
- **Paste support** : coller un code à 6 chiffres remplit les 6 cases automatiquement.
- **Auto-submit** : quand les 6 chiffres sont saisis, déclencher automatiquement l'appel API (sans attendre le tap bouton).
- **Visual feedback** : case remplie → bordure verte `#10B981`. Case vide → bordure grise `#D1D5DB`.

---

## 4. API Call — POST /auth/otp/verify

| Propriété | Valeur |
|-----------|--------|
| **Method** | POST |
| **URL** | `{base_url}/auth/otp/verify` |
| **Headers** | `Content-Type: application/json` |
| **Body** | `{ "phone": "{{phone_number}}", "code": "{{code}}", "purpose": "login" }` |

### Success (200)

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user_id": "uuid"
}
```

**Actions** :
1. Stocker `access_token`, `refresh_token`, `user_id` dans App State + Secure Storage
2. Décoder JWT payload → extraire `role` (patient/pharmacy)
3. Stocker `role` dans App State
4. Naviguer vers Home (patient) ou Pharmacy Dashboard (pharmacy)
5. Analyser `cooldown_seconds` du Login n'est plus nécessaire — démarrer cooldown resend à 30s

### Error (401) — Code incorrect

```json
{
  "error": { "code": "UNAUTHORIZED", "message": "Invalid code" }
}
```

**Actions** :
1. Afficher "Code incorrect. Réessayez."
2. Effacer les 6 inputs
3. Focus sur le premier input
4. Décrémenter `attempts_left`
5. Si `attempts_left == 0` : afficher "Trop de tentatives. Veuillez redemander un code." + rediriger vers Login

### Rate Limited (429)

**Actions** : Afficher le cooldown du serveur, désactiver le bouton Renvoyer.

### Network Error

**Actions** : Afficher "Erreur réseau. Vérifiez votre connexion." Conserver le code saisi.

---

## 5. Resend Code (Cooldown Logic)

| State | Affichage | Action |
|-------|-----------|--------|
| `resend_cooldown > 0` | "Renvoyer le code dans Xs" (gris, non cliquable) | Timer.periodic (1s) décrémente |
| `resend_cooldown == 0` | "Renvoyer le code" (bleu #0F5B6E, cliquable) | Tap → POST /auth/otp/request → nouveau code + reset cooldown 30s |

Le cooldown de 30s est local (UI). Le rate limit (429) est serveur (10 min). Les deux coexistent.

---

## 6. Transitions & Navigation

| Déclencheur | Destination | Data |
|-------------|-------------|------|
| Tap ← Retour | Login Screen | — |
| 6 chiffres tapés → verify success + role=patient | Home / My Requests | Tokens, user_id |
| 6 chiffres tapés → verify success + role=pharmacy | Pharmacy Dashboard | Tokens, user_id |
| 401 × 5 attempts | Login Screen | Effacer tokens |
| Tap "Renvoyer" | (same screen) | Nouvel appel POST /auth/otp/request |

---

## 7. Edge Cases

| Scenario | Comportement |
|----------|-------------|
| User tape 6 chiffres et l'appel échoue | Erreur affichée, les 6 chiffres sont conservés, focus sur input 1 |
| User colle un code de 6 chiffres | Les 6 cases se remplissent, auto-submit |
| User colle un code de + ou - de 6 chiffres | Ignoré, ne pas coller |
| Rate limit atteint sur resend | Afficher "Trop de tentatives. Réessayez dans X minutes." |
| App kill pendant verify | Au prochain splash → refresh token pas encore stocké → redirigé vers Login |
| Multi-tap sur "Vérifier" | Bouton disabled immédiatement, un seul appel possible |
| Code reçu par SMS mais l'utilisateur change d'avis | Tap ← Retour → Login, aucun état persistant |

---

## 8. Test Checklist

- [ ] Affichage du masked_phone depuis l'écran Login
- [ ] 6 inputs auto-advance, auto-remove sur Backspace
- [ ] Paste d'un code à 6 chiffres fonctionne
- [ ] Auto-submit quand les 6 chiffres sont saisis
- [ ] "Code incorrect" affiché sur 401
- [ ] Max 5 tentatives → redirection Login
- [ ] Cooldown "Renvoyer dans Xs" avec timer
- [ ] Tap "Renvoyer" → nouvel appel OTP request
- [ ] Succès → tokens stockés dans Secure Storage
- [ ] Rôle patient → Home, rôle pharmacy → Dashboard
- [ ] ← Retour → Login, efface les données OTP
- [ ] Bouton disabled pendant loading