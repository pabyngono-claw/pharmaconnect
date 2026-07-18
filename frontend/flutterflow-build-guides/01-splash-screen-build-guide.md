# PharmaConnect -- Splash Screen Build Guide

**FlutterFlow build instructions for Screen 1/21**
Source of truth: `frontend/screens/01-splash-screen.md`

---

## 1. App State Variables

**Menu:** Settings & Integrations -> App State -> + Add

Create these 6 App State variables:

| # | Name | Type | Default Value |
|---|------|------|---------------|
| 1 | `access_token` | String | `""` |
| 2 | `refresh_token` | String | `""` |
| 3 | `user_id` | String | `""` |
| 4 | `user_role` | String | `""` |
| 5 | `user_phone` | String | `""` |
| 6 | `is_logged_in` | Boolean | `false` |

**Secure Storage note**: FlutterFlow does not persist App State automatically. Tokens must be written to/read from `flutter_secure_storage` via the Custom Action (Step 3). App State holds values only for the current session; on app restart, the Custom Action repopulates them from secure storage.

---

## 2. API Call Setup

**Menu:** Settings & Integrations -> API Calls -> + Add API

| Field | Value |
|-------|-------|
| **API Call Name** | `auth_refresh` |
| **Method** | `POST` |
| **Base URL** | Your Xano workspace URL (e.g. `https://xxxx.xano.io/api/v1`) |
| **Path** | `/auth/refresh` |
| **Headers** | `Content-Type: application/json` |
| **Body** | `{ "refresh_token": "{{app_state.refresh_token}}" }` |

**Variables tab** -- define 2 response variables:

| Variable Name | Type | JSON Path |
|---------------|------|-----------|
| `api_access_token` | String | `access_token` |
| `api_refresh_token` | String | `refresh_token` |

**Test tab**: Enter a valid refresh token and click Test. Expected: 200 with `{ "access_token": "...", "refresh_token": "..." }`.

---

## 3. Custom Action: `checkAuthState`

**Menu:** Settings & Integrations -> Custom Code -> Custom Actions -> + Add

| Field | Value |
|-------|-------|
| **Name** | `checkAuthState` |
| **Return Type** | `Map<String, dynamic>` |

**Code** -- paste exactly:

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
  
  const baseUrl = 'VOTRE_XANO_WORKSPACE_URL';
  
  try {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/refresh'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refresh_token': refreshToken}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final newAccessToken = data['access_token'] as String;
      final newRefreshToken = data['refresh_token'] as String;
      
      await storage.write(key: 'access_token', value: newAccessToken);
      await storage.write(key: 'refresh_token', value: newRefreshToken);
      
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
    return {'status': 'network_error'};
  }
}
```

**IMPORTANT**: Replace `VOTRE_XANO_WORKSPACE_URL` with your actual Xano API base URL before testing.

**Dependencies** (pubspec.yaml additions):
- `flutter_secure_storage: ^9.0.0`
- `http: ^1.2.0`

---

## 4. Page Setup

**Menu:** Pages -> + Add Page (or duplicate Blank)

| Property | Value |
|----------|-------|
| **Page Name** | `SplashScreen` |
| **Page Title** | `Splash` |
| **Background Color** | `#FFFFFF` |
| **Page Scrollable** | Off (Not scrollable) |
| **Loading Placeholder** | None |
| **Safe Area** | Enabled |

---

## 5. Widget Tree

Build this exact hierarchy:

```
Page (SplashScreen)
└── Column
    ├── SizedBox (spacer, flex: 1)
    ├── Column (logo block)
    │   ├── Icon
    │   │   ├── Name: local_hospital (built-in Material icon)
    │   │   ├── Size: 64
    │   │   └── Color: #0F5B6E
    │   └── Text (PharmaConnect)
    │       ├── Value: "PharmaConnect"
    │       ├── Size: 28
    │       ├── Font Weight: bold
    │       ├── Color: #0F5B6E
    │       └── Alignment: center
    ├── SizedBox (vertical spacing, height: 32)
    ├── CircularProgressIndicator
    │   ├── Width: 40
    │   ├── Height: 40
    │   └── Color: #0F5B6E
    ├── SizedBox (vertical spacing, height: 16)
    ├── Text (Chargement...)
    │   ├── Value: "Chargement..."
    │   ├── Size: 14
    │   ├── Color: #9CA3AF
    │   └── Alignment: center
    └── SizedBox (spacer, flex: 1)
```

### Widget properties in detail

**Page -> Column** (root):
| Property | Value |
|----------|-------|
| Main Axis Alignment | center |
| Cross Axis Alignment | center |

**Column (logo block)** -- child of root:
| Property | Value |
|----------|-------|
| Main Axis Alignment | center |
| Cross Axis Alignment | center |

**Icon** -- child of logo block:
| Property | Value |
|----------|-------|
| Icon | `local_hospital` (or upload custom SVG: cross-green-and-crescent) |
| Size | 64 |
| Color | `#0F5B6E` |

**Text (PharmaConnect)** -- child of logo block:
| Property | Value |
|----------|-------|
| Value | `PharmaConnect` |
| Font Size | 28 |
| Font Weight | bold |
| Text Color | `#0F5B6E` |
| Text Align | center |

**SizedBox (32px)** -- between logo block and spinner.

**CircularProgressIndicator**:
| Property | Value |
|----------|-------|
| Width | 40 |
| Height | 40 |
| Stroke Width | 4 (default) |
| Color | `#0F5B6E` |

**SizedBox (16px)** -- between spinner and "Chargement...".

**Text (Chargement...)**:
| Property | Value |
|----------|-------|
| Value | `Chargement...` |
| Font Size | 14 |
| Text Color | `#9CA3AF` |
| Text Align | center |

---

## 6. Page Actions (On Page Load)

This is the core logic. Configure these actions on the page's **On Page Load** trigger.

**Menu:** Select the page -> Properties panel (right side) -> **Actions** -> On Page Load -> + Add

### Action flow:

```
On Page Load
  └── Step 1: Timer
  │       ├── Type: Wait (delay)
  │       └── Duration: 500 milliseconds
  │       └── Then:
  │           └── Step 2: Call Custom Action
  │                   ├── Custom Action: checkAuthState
  │                   └── Store result in: Page State variable `auth_result`
  │                   └── Then:
  │                       └── Step 3: Conditional
  │                               ├── Condition: `auth_result['status'] == 'authenticated'`
  │                               ├── TRUE:
  │                               │   └── Sub-step 3a: Set App State
  │                               │   │       ├── access_token = auth_result['access_token']  (from Custom Action return)
  │                               │   │       └── user_role = auth_result['role']
  │                               │   │       └── user_id = auth_result['user_id']
  │                               │   │       └── is_logged_in = true
  │                               │   └── Sub-step 3b: Conditional (role check)
  │                               │           ├── Condition: `auth_result['role'] == 'pharmacy'`
  │                               │           ├── TRUE -> Navigate To -> PharmacyDashboardScreen
  │                               │           └── FALSE -> Navigate To -> HomeScreen
  │                               └── FALSE:
  │                                   └── Sub-step 3c: Set App State
  │                                   │       └── is_logged_in = false
  │                                   └── Sub-step 3d: Navigate To -> LoginScreen
```

### Detailed action configuration:

#### Step 1: Timer

**Menu:** Click "+ Add Action" -> **Timer** -> **Wait (delay)**

| Property | Value |
|----------|-------|
| Wait Duration | `500` |
| Units | Milliseconds |

#### Step 2: Call Custom Action

Add after the Timer. **Menu:** "+ Add Action" -> **Custom Action** -> `checkAuthState`

| Property | Value |
|----------|-------|
| Custom Action | `checkAuthState` |
| Store In | `auth_result` (Page State variable -- create it first) |

#### Step 3: Conditional (auth check)

Add after the Custom Action. **Menu:** "+ Add Action" -> **Conditional**

| Property | Value |
|----------|-------|
| Condition | `auth_result['status'] == 'authenticated'` |

#### Step 3a (TRUE): Set multiple App State variables

For each variable, add a **Set App State Variable** action:

| Action Target | Value |
|---------------|-------|
| `access_token` | `auth_result['access_token']` |
| `refresh_token` | *(already updated inside Custom Action)* |
| `user_role` | `auth_result['role']` |
| `user_id` | `auth_result['user_id']` |
| `is_logged_in` | `true` |

#### Step 3b (nested inside TRUE): Conditional for role

| Property | Value |
|----------|-------|
| Condition | `auth_result['role'] == 'pharmacy'` |

**TRUE branch** -> Navigate To -> `PharmacyDashboardScreen`
| Property | Value |
|----------|-------|
| Action | Navigate To |
| Page | `PharmacyDashboardScreen` |
| Type | Replace (clear navigation stack) |

**FALSE branch** -> Navigate To -> `HomeScreen`
| Property | Value |
|----------|-------|
| Action | Navigate To |
| Page | `HomeScreen` |
| Type | Replace (clear navigation stack) |

#### Step 3c (FALSE): Set App State

| Action Target | Value |
|---------------|-------|
| `is_logged_in` | `false` |

#### Step 3d (FALSE): Navigate To

| Property | Value |
|----------|-------|
| Action | Navigate To |
| Page | `LoginScreen` |
| Type | Replace (clear navigation stack) |

---

## 7. Page State Variable

**Menu:** Select page -> Page State (bottom panel) -> + Add

| Name | Type | Default |
|------|------|---------|
| `auth_result` | Custom Data Type (Map) | `{}` |

Since FlutterFlow cannot pre-type a Map, set it as **Custom Data Type** and leave the structure empty. It will be populated at runtime by the Custom Action.

---

## 8. Navigation Routing

Set `SplashScreen` as the **Home Page** (first page shown on app launch).

**Menu:** Settings & Integrations -> App Info -> General -> Home Page

| Property | Value |
|----------|-------|
| Home Page | `SplashScreen` |

---

## 9. Secure Storage Initialization (First Launch)

On very first launch, no secure storage keys exist. The `checkAuthState()` Custom Action handles this:

1. `storage.read(key: 'refresh_token')` returns `null`
2. Function returns `{'status': 'no_token'}`
3. Conditional routes to `LoginScreen`

No additional setup needed.

---

## 10. Dependencies

Before the app can build, add these packages:

**Menu:** Settings & Integrations -> Custom Code -> Dependencies -> + Add

| Package | Version |
|---------|---------|
| `flutter_secure_storage` | `^9.0.0` |
| `http` | `^1.2.0` |

---

## 11. Test Checklist

Execute each scenario in FlutterFlow's **Run mode** (not Preview mode, since secure storage requires a real device/emulator).

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | First launch, no tokens | Install app, open | Splash -> spinner -> routes to LoginScreen |
| 2 | Valid refresh token | Login, kill app, reopen | Splash -> spinner -> routes to HomeScreen |
| 3 | Expired refresh token | Wait 30 days or clear storage, reopen | Splash -> spinner -> routes to LoginScreen |
| 4 | Pharmacy role token | Login as pharmacy staff, kill app, reopen | Splash -> spinner -> routes to PharmacyDashboardScreen |
| 5 | Network error | Airplane mode, reopen | Splash -> spinner -> routes to LoginScreen (fallback) |
| 6 | Timer visible | Fresh install | Logo + spinner visible for minimum 500ms before navigation |
| 7 | No user interaction | All scenarios | No buttons, no taps accepted -- purely passive screen |

---

## 12. Verification

After building, confirm:

- [ ] App State has all 6 variables (`access_token`, `refresh_token`, `user_id`, `user_role`, `user_phone`, `is_logged_in`)
- [ ] API Call `auth_refresh` exists and returns 200/401
- [ ] Custom Action `checkAuthState` compiles without errors
- [ ] Dependencies `flutter_secure_storage` and `http` added
- [ ] Page State variable `auth_result` exists
- [ ] On Page Load has: Timer(500ms) -> checkAuthState -> Conditional -> Navigate
- [ ] SplashScreen is set as Home Page
- [ ] Widget tree matches spec (Icon -> Text -> Spacer -> Spinner -> Spacer -> Text)
- [ ] All 7 test scenarios pass on device/emulator