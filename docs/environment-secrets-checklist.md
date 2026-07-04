# Environment & Secrets Checklist — PharmaConnect v2.0

## Required Before First Deploy

### Xano
- [ ] Xano workspace created
- [ ] Xano API URL recorded
- [ ] Xano API token for backend-to-backend calls
- [ ] Xano file storage region selected
- [ ] Custom auth enabled in Xano app settings
- [ ] Email/SMS provider configured in Xano (for OTP)
- [ ] Database created with all 21 tables per import-manifest.md
- [ ] API groups deployed matching api-snapshot.md
- [ ] Scheduled tasks enabled per scheduled-tasks-guide.md

### FlutterFlow / Mobile
- [ ] Firebase project created
- [ ] Android app registered in Firebase
- [ ] iOS app registered in Firebase
- [ ] google-services.json and GoogleService-Info.plist added to FlutterFlow
- [ ] FCM push enabled
- [ ] SHA-1 / SHA-256 fingerprints added to Firebase for Android
- [ ] Bundle ID / Package name matches store listings
- [ ] App signing configured for Play Store

### Frontend Dependencies
- [ ] Inter font added to FlutterFlow assets
- [ ] Google Maps API key added (iOS + Android + Web restrictions)
- [ ] Image compressor config in FlutterFlow custom code
- [ ] Permission handler enabled (camera, storage, notifications, location)

### Cloudflare
- [ ] Cloudflare account created
- [ ] API token created with Workers + DNS edit permissions
- [ ] Account ID noted
- [ ] KV namespace created for static assets cache
- [ ] Worker site bucket configured
- [ ] Custom domain attached to Worker route
- [ ] SSL/TLS set to Full (strict)

### Payments
- [ ] Orange Money merchant agreement signed
- [ ] Orange Money API credentials obtained
- [ ] Wave merchant agreement signed
- [ ] Wave API credentials obtained
- [ ] Webhook endpoints configured with provider
- [ ] Test mode enabled; sandbox credentials recorded

### CI/CD
- [ ] GitHub repo secrets set:
  - CLOUDFLARE_API_TOKEN
  - CLOUDFLARE_ACCOUNT_ID
  - XANO_API_TOKEN
  - FIREBASE_TOKEN (for FlutterFlow/Codemagic if used)
  - PLAY_STORE_SERVICE_ACCOUNT_JSON (if using Fastlane)
  - APP_STORE_CONNECT_API_KEY (if using Fastlane)
- [ ] Workflow permissions verified in repo Settings > Actions
- [ ] Branch protection enabled on main

### Monitoring
- [ ] Cloudflare Analytics enabled for Worker
- [ ] Sentry or Firebase Crashlytics configured in FlutterFlow
- [ ] Xano API logs retention set to 30 days
- [ ] Audit log export policy defined

## Secrets Storage Rules
- Never store secrets in git; always use GitHub Secrets or Wrangler secrets.
- Rotate API tokens quarterly.
- Payment provider secrets stored only in Xano env vars + Cloudflare secrets.
- Firebase service account JSON stored only in CI secrets.
