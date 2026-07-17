# PharmaConnect — Écran 1/21 : Splash

**Phase 1 — Patient** · Fichier : `splash_screen.md`

---

## 1. UI Layout

```
┌─────────────────────────┐
│                         │
│                         │
│         🏥             │
│   PharmaConnect         │  ← Texte "PharmaConnect", taille 28, bold, couleur #0F5B6E
│                         │
│    [   ○ spinner   ]    │  ← CircularProgressIndicator, couleur #0F5B6E, taille 40
│                         │
│     Chargement...       │  ← Texte gris (#9CA3AF), taille 14
│                         │
│                         │
│                         │
│                         │
│                         │
└─────────────────────────┘
```

**Couleurs** :
- Fond : blanc `#FFFFFF`
- Primaire : `#0F5B6E` (logo + spinner)
- Texte secondaire : `#9CA3AF` ("Chargement...")
- Texte logo : `#0F5B6E`

**Éléments** :
1. Icône / emoji pharmacie (🏥 ou croix verte + croissant rouge) — centré
2. Texte "PharmaConnect" — centré, 28px, bold
3. Spinner circulaire — centré
4. Texte "Chargement..." — centré, 14px, gris

**Aucun bouton, aucune interaction utilisateur** — écran purement transitif.

---

## 2. App State Variables (FlutterFlow)

Ces variables doivent être créées dans **App State** (persistantes pour la session) :

| Nom | Type | Default | Stockage persistant |
|-----|------|---------|---------------------|
| `access_token` | String | "" | Oui (secure storage) |
| `refresh_token` | String | "" | Oui (secure storage) |
| `user_id` | String | "" | Oui (secure storage) |
| `user_role` | String | "" | Oui (secure storage : "patient" ou "pharmacy") |
| `user_phone` | String | "" | Oui (secure storage) |
| `is_logged_in` | Boolean | false | — (calculé au lancement) |

---

## 3. Auth Check Flow (Custom Action / Widget State)

FlutterFlow ne supporte pas nativement le secure storage ni les appels conditionnels complexes en cascade. Approche recommandée :

### Option A — Custom Action en Dart (recommandée)

Créer une **Custom Action** nommée `checkAuthState` qui :
1. Lit `access_token`, `refresh_token` depuis `flutter_secure_storage`
2. Si `refresh_token` vide → retourne `{ status: "no_token" }`
3. Si `refresh_token` présent → appelle `POST /auth/refresh` avec body `{ "refresh_token": "..." }`
4. Si refresh retourne 200 → stocke les nouveaux tokens → retourne `{ status: "authenticated", role, user_id }`
5. Si refresh retourne 401 → efface les tokens → retourne `{ status: "no_token" }`

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>> checkAuthState() async {
  const storage = FlutterSecureStorage();
  
  final refreshToken = await storage.read(key: 'refresh_token');
  if (refreshToken == null || refreshToken.isEmpty) {
    return {'status': 'no_token'};
  }
  
  // Base URL configurée dans FlutterFlow
  const baseUrl = 'VOTRE_XANO_WORKSPACE_URL';
  
  try {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/refresh'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refresh_token': refreshToken}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final newAccessToken = data['access_token'];
      final newRefreshToken = data['refresh_token'];
      
      await storage.write(key: 'access_token', value: newAccessToken);
      await storage.write(key: 'refresh_token', value: newRefreshToken);
      
      // Décoder le JWT pour extraire role et user_id (payload base64)
      final parts = newAccessToken.split('.');
      if (parts.length == 3) {
        final payload = jsonDecode(
          utf8.decode(base64.decode(base64.normalize(parts[1])))
        );
        return {
          'status': 'authenticated',
          'role': payload['role'] ?? 'patient',
          'user_id': payload['sub'] ?? payload['user_id'] ?? '',
        };
      }
      
      return {'status': 'authenticated', 'role': 'patient', 'user_id': ''};
    } else {
      await storage.deleteAll();
      return {'status': 'no_token'};
    }
  } catch (e) {
    // Erreur réseau — on reste silencieux, on redirige vers login
    return {'status': 'network_error'};
  }
}
```

### Option B — API Call + Conditions (simplifiée, sans Custom Action)

Si vous préférez éviter le Dart custom, alternative dans FlutterFlow :

1. **Page State** : créer une variable `auth_status` (String)
2. **On Page Load** → déclencher un **Timer** (0.5 secondes pour l'animation splash)
3. Aprés le timer, **Condition** :
   - Lire App State `refresh_token`
   - Si vide → `Navigation vers Login`
   - Si non vide → **API Call** : `POST /auth/refresh`
4. Sur **Success** de l'API Call → stocker les nouveaux tokens dans App State + `Navigation vers Home`
5. Sur **Error** → effacer App State tokens → `Navigation vers Login`

---

## 4. Navigation

| Condition | Destination | Paramètres |
|-----------|-------------|------------|
| `status = "authenticated"` + `role = "patient"` | `HomeScreen` (My Requests) | `user_id`, `access_token` |
| `status = "authenticated"` + `role = "pharmacy"` | `PharmacyDashboardScreen` | `user_id`, `access_token` |
| `status = "no_token"` ou `status = "network_error"` | `LoginScreen` | — |

⚠️ **Important** : Les écrans `HomeScreen` et `PharmacyDashboardScreen` n'existent pas encore — ils seront créés dans les étapes suivantes. Pour l'instant, naviguer vers une **page temporaire** de test.

---

## 5. API Binding — POST /auth/refresh

| Propriété | Valeur |
|-----------|--------|
| **Méthode** | POST |
| **URL** | `{base_url}/auth/refresh` |
| **Headers** | `Content-Type: application/json` |
| **Body** | `{ "refresh_token": "{{app_state.refresh_token}}" }` |
| **Success Code** | 200 |
| **Error Code** | 401 |
| **Variables de réponse** | `access_token` → stocker dans App State<br>`refresh_token` → stocker dans App State |

**Réponse 200** :
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

**Réponse 401** :
```json
{
  "error": { "code": "UNAUTHORIZED", "message": "Invalid or expired refresh token" }
}
```

---

## 6. Timing

| Événement | Délai |
|-----------|-------|
| Logo affiché | Immédiat |
| Spinner démarre | Immédiat |
| Appel auth refresh | 500ms après rendu (pour animation splash visible) |
| Navigation | Immédiat après réponse |

---

## 7. Test Checklist (à valider dans FF)

- [ ] L'écran s'affiche avec logo + spinner + "Chargement..."
- [ ] Aucun token stocké → navigation vers Login
- [ ] Token refresh valide → navigation vers Home
- [ ] Token refresh expiré → navigation vers Login
- [ ] Erreur réseau → navigation vers Login (fallback)
- [ ] Nouveaux tokens stockés après refresh réussi
- [ ] Rôle patient → Home patient
- [ ] Rôle pharmacy → Pharmacy Dashboard (à créer)
- [ ] Aucun bouton ni interaction utilisateur visible
- [ ] Spinner tourne pendant l'appel API

---

**Résumé** : 1 écran transitif, 1 appel API (POST /auth/refresh), 0 interaction utilisateur. Routage conditionnel vers Login ou Home selon le résultat. Temps de build estimé dans FlutterFlow : ~20 min (UI) + Custom Action si option A choisie.

**Prochain écran après validation** : Login (saisie téléphone + OTP request).