# FlutterFlow Implementation Guide — PharmaConnect v2.0

Use with the existing specs in frontend/flutterflow/components.md and screen-specs.md.

## Project Setup

### 1. Create FlutterFlow Project
- Name: PharmaConnect
- Package: com.pharmaconnect.app
- Platforms: Android, iOS, Web
- Language: Dart

### 2. Add Dependencies
In pubspec.yaml add:
- google_maps_flutter
- firebase_messaging
- firebase_core
- flutter_image_compress
- image_picker
- permission_handler
- http
- provider or riverpod for state management
- go_router for navigation

### 3. Theme Setup
Import design tokens from references/design-tokens.md:
- PrimaryColor: #0F5B6E
- SecondaryColor: #FF7A00
- SuccessColor: #1D8A4B
- WarningColor: #C57B00
- ErrorColor: #C0392B
- InfoColor: #2471A3
- BackgroundColor: #F7FAFC
- SurfaceColor: #FFFFFF
- BorderColor: #E2E8F0
- FontFamily: Inter (add to assets/fonts)

Define custom widgets:
- StatusBadge
- ResponseCard
- RequestTimeline
- DocumentUploadTile
- EmptyState

Ensure all custom widgets use the tokens, not hardcoded values.

## Routing

### Patient Flow
- / -> Splash/Language
- /login -> OTP/Google login
- /requests/new -> Create request
- /requests/:id -> Request detail
- /requests/:id/pharmacies -> Pharmacy list
- /reservations/:id -> Reservation detail
- /profile -> Patient profile

### Pharmacy Flow
- /pharmacy/login -> Pharmacy login
- /pharmacy/dashboard -> Dashboard
- /pharmacy/requests/:id -> Request detail
- /pharmacy/waiting-list -> Waiting list
- /pharmacy/profile -> Pharmacy profile

### Admin Flow
- /admin/login -> Admin login
- /admin/pharmacies -> Pharmacy list
- /admin/pharmacies/:id/review -> Review
- /admin/requests -> All requests

## API Integration Pattern

### Base Client
Create ApiClient class wrapping http with:
- Base URL: Xano API endpoint
- Interceptor adding Authorization: Bearer <access_token>
- Refresh token flow on 401
- Error envelope parsing: extract error.code, error.message, error.field_errors

### Rate Limiting
- OTP endpoint: show cooldown timer from response.cooldown_seconds
- Do not disable button silently; show remaining seconds.

### Image Upload
- Use flutter_image_compress to max 1600px JPEG 80 before upload
- Show upload progress in DocumentUploadTile
- Retry without full resubmit

### State Machines
Never compute reservation state locally. Always query server state.
Use server-driven UI hints from API response.status for badge colors.

### Idempotency
All reservation/payment mutations use a UUID idempotency key stored in shared_preferences for retry safety.

## Accessibility Checklist
- All interactive widgets >= 48x48dp
- Semantics labels on image upload actions
- Test flows at 2x system font size
- No fixed-height containers for text

## Offline Behavior
- Reads: cache with provider; show cached immediately; background refresh with inline banner on error
- Writes: disable mutation buttons with "No connection" message; do not queue silently

## Push Notifications
- Request permission post-login, not on launch
- Handle denied with in-app message
- Send FCM token to /push-tokens after consent
- Deep-link routes for: request/response/reservation/waiting/payment/subscription
