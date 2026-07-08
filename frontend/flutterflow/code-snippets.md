# FlutterFlow Code Snippets — PharmaConnect v2.0

Extraits de code Dart prêts à coller dans les zones Custom Code / Global Actions de FlutterFlow.
Ne pas inclure dans le dépôt les secrets ou les tokens ; injecter par variables d’environnement au runtime.

## 1) Theme tokens
Chemin suggéré dans FlutterFlow : Project Settings > Theme > Custom Theme > Custom Code
------------------------------------------------------------------

```dart
class PCTokens {
  PCTokens._();

  static const primary = Color(0xFF0F5B6E);
  static const secondary = Color(0xFFFF7A00);
  static const success = Color(0xFF1D8A4B);
  static const warning = Color(0xFFC57B00);
  static const error = Color(0xFFC0392B);
  static const info = Color(0xFF2471A3);
  static const neutral = Color(0xFF4A5568);
  static const neutralSecondary = Color(0xFF718096);
  static const background = Color(0xFFF7FAFC);
  static const surface = Color(0xFFFFFFFF);
  static const border = Color(0xFFE2E8F0);

  static const fontFamily = 'Inter';

  static const unit1 = 4.0;
  static const unit2 = 8.0;
  static const unit3 = 12.0;
  static const unit4 = 16.0;
  static const unit6 = 24.0;
  static const unit8 = 32.0;
  static const unit12 = 48.0;

  static const radiusSmall = 6.0;
  static const radiusMedium = 10.0;
  static const radiusLarge = 16.0;
}
```

## 2) Status badge mapping
------------------------------------------------------------------

```dart
enum PCStatusKey {
  reserved,
  active,
  ready,
  served,
  submitted,
  sent,
  viewed,
  responded,
  pending,
  rejected,
  expired,
  cancelled,
  pharmacyApproved,
  pharmacyPending,
  documentPending,
  subscriptionTrial,
  subscriptionActive,
  subscriptionPastDue,
  subscriptionExpired,
}

class PCStatusStyle {
  final Color color;
  final String labelFr;
  const PCStatusStyle(this.color, this.labelFr);

  static const values = {
    PCStatusKey.reserved: PCStatusStyle(PCTokens.success, 'Reserve'),
    PCStatusKey.active: PCStatusStyle(PCTokens.success, 'Actif'),
    PCStatusKey.ready: PCStatusStyle(PCTokens.success, 'Pret'),
    PCStatusKey.served: PCStatusStyle(PCTokens.success, 'Servi'),
    PCStatusKey.submitted: PCStatusStyle(PCTokens.info, 'Soumis'),
    PCStatusKey.sent: PCStatusStyle(PCTokens.info, 'Envoyee'),
    PCStatusKey.viewed: PCStatusStyle(PCTokens.neutralSecondary, 'Consultee'),
    PCStatusKey.responded: PCStatusStyle(PCTokens.secondary, 'Reponse recue'),
    PCStatusKey.pending: PCStatusStyle(PCTokens.warning, 'En attente'),
    PCStatusKey.rejected: PCStatusStyle(PCTokens.error, 'Refuse'),
    PCStatusKey.expired: PCStatusStyle(PCTokens.neutral, 'Expire'),
    PCStatusKey.cancelled: PCStatusStyle(PCTokens.neutral, 'Annule'),
    PCStatusKey.pharmacyApproved: PCStatusStyle(PCTokens.success, 'Approuvee'),
    PCStatusKey.pharmacyPending: PCStatusStyle(PCTokens.info, 'En attente'),
    PCStatusKey.documentPending: PCStatusStyle(PCTokens.warning, 'Documents en attente'),
    PCStatusKey.subscriptionTrial: PCStatusStyle(PCTokens.info, 'Essai'),
    PCStatusKey.subscriptionActive: PCStatusStyle(PCTokens.success, 'Actif'),
    PCStatusKey.subscriptionPastDue: PCStatusStyle(PCTokens.warning, 'Retard'),
    PCStatusKey.subscriptionExpired: PCStatusStyle(PCTokens.neutral, 'Expire'),
  };
}
```

## 3) Base API client
Chemin suggéré : Custom Code > Services > ApiClient
------------------------------------------------------------------

```dart
class ApiClient {
  ApiClient._(this.baseUrl, this._tokenProvider);

  final String baseUrl;
  final Future<String?> Function() _tokenProvider;

  static Future<ApiClient> create(String baseUrl, Future<String?> Function() tokenProvider) async {
    return ApiClient._(baseUrl, tokenProvider);
  }

  Future<({Map<String, String> headers, dynamic body})> _authHeaders({Map<String, String>? extra, dynamic body}) async {
    final token = await _tokenProvider();
    final headers = <String, String>{
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
    headers.addAll(extra ?? {});
    return (headers: headers, body: body);
  }

  Future<http.Response> get(String path, {Map<String, String>? query}) async {
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: query);
    final auth = await _authHeaders();
    return http.get(uri, headers: auth.headers);
  }

  Future<http.Response> post(String path, dynamic body) async {
    final uri = Uri.parse('$baseUrl$path');
    final auth = await _authHeaders(body: body);
    return http.post(uri, headers: auth.headers, body: jsonEncode(auth.body));
  }

  Future<http.Response> postWithIdempotency(String path, dynamic body, String idempotencyKey) async {
    final uri = Uri.parse('$baseUrl$path');
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    };
    final token = await _tokenProvider();
    if (token != null && token.isNotEmpty) headers['Authorization'] = 'Bearer $token';
    return http.post(uri, headers: headers, body: jsonEncode(body));
  }
}
```

## 4) Router configuration
Chemin suggéré : Global Actions / Navigation > GoRouter config
------------------------------------------------------------------

```text
/
/login
/requests/new
/requests/:id
/requests/:id/pharmacies
/reservations/:id
/profile

/pharmacy/login
/pharmacy/dashboard
/pharmacy/requests/:id
/pharmacy/waiting-list
/pharmacy/profile

/admin/login
/admin/pharmacies
/admin/pharmacies/:id/review
/admin/requests
```

## 5) Image upload rules
Client-side, à intégrer dans les flux de création de demande et documents :
- Compresser a 1600px JPEG 80 avant upload
- EXIF stripping automatique par compression
- Ajouter Semantics label sur chaque action d upload
- Afficher la progression dans un widget local
- Permettre le retry sans re-soumettre tout le formulaire

## 6) Offline behavior
- Reads : cache local d abord, puis background refresh ; banniere d erreur si fetch echoue
- Writes : desactiver les boutons de mutation avec un message inline "No connection"; ne pas mettre en queue silencieusement

## 7) Accessibilité
- Tous les widgets cliquables >= 48x48dp
- Labels de lecteur d ecran sur les actions d upload
- Tester les flux en taille systeme x2
- Pas de conteneurs texte a hauteur fixe
- Les skeletons doivent reproduire la disposition reelle des listes

## 8) Remarque TVA/Otp/payments
- TVA calculee cote serveur ; ne jamais afficher un total issu du client seul sans confirmation API
- OTP : afficher cooldown_seconds issu de /auth/otp/request
- Paiements : ne jamais stocker de provider secret dans le client ; utiliser WebView ou route backend dediee pour Orange Money / Wave si necessaire
```
