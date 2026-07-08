# FlutterFlow Project Setup — PharmaConnect v2.0

Use this when creating or configuring the FlutterFlow project.
All bundle IDs, Google Services JSON paths, Apple team IDs, and store URLs are placeholders.
Replace placeholders before store submission.

## General
- Project name: PharmaConnect
- Bundle ID Android: `com.pharmaconnect.app`
- Bundle ID iOS: `com.pharmaconnect.app`
- Flutter version: stable 3.x as supported by FlutterFlow at build time
- Minimum Android SDK: 23
- Minimum iOS target: 12.0

## Firebase
- Project: `pharmaconnect-prod`
- Add Android app with SHA-1 from your keystore
- Add iOS app with Apple team ID
- Download and upload `google-services.json` and `GoogleService-Info.plist` in FlutterFlow Project Settings > Integrations > Firebase

## Push notifications
- Use Firebase Cloud Messaging v1 API
- Server key never in client code; Worker does not currently translate FCM but Xano scheduled job can if needed

## OAuth / Social
- Google Sign-In enabled in Firebase Auth
- Apple Sign-In only needed if you submit to App Store with Sign in with Apple requirement

## Web
- Web build output directory: `build/web`
- Custom domain suggestion: `app.pharmaconnect.example`
- Worker host: `https://pharmaconnect-web.<your-subdomain>.workers.dev` until custom domain is bound

## Store metadata placeholders
- Privacy policy URL: `https://pharmaconnect.example/privacy`
- Terms URL: `https://pharmaconnect.example/terms`
- Support email: `support@pharmaconnect.example`
- Senegal phone support: `+221 XX XXX XX XX`

## Icons & Splash
- Adaptive icon Android: foreground + background layers required
- iOS icon: use App Store asset pack in FlutterFlow
- Splash screen color: `#0F5B6E` from `PCTokens.primary`