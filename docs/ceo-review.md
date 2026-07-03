# CEO Review — PharmaConnect v2.0

Status: Locked
Date: 2026-07-03

## Vision Lock

PharmaConnect is a Senegal-focused pharmacy connectivity platform built on Xano + FlutterFlow.

It solves a real logistics problem: patients submit requests/prescriptions, pharmacies respond, and reservations manage the handoff.

The product ships as a web + mobile app layered on Cloudflare Workers static hosting.

## Scope Lock

Core scope is the patient journey plus the pharmacy operational journey.

Patient: Discovery → Upload prescription/product request → Pharmacy selection → Responses → Reserve → Collect → Return

Pharmacy: Register + upload documents → Approval → Receive requests → Respond → Mark ready/served → Serve next waiting patient

Nothing beyond these journeys is in scope for v2.0.

## Out of Scope

- Prescription diagnosis or clinical advice
- Direct pharmacy POS replacement
- Insurance/fraud adjudication
- Cross-border pharmacy marketplace

## Success Criteria

- Patient can submit a request in < 3 minutes without login, then sign up to save it
- Pharmacy can respond in < 1 minute per request from dashboard
- Reservation held reliably with 422 on illegal transitions
- 21-table schema normalized in Xano with server-side TVA
- 12 QA test cases green before any release
- WCAG 2.1 AA compliance on patient-facing screens

## Revenue Model

Starter / Pro / Enterprise subscriptions via Xano + Stripe.
Free tier allowed for patients; pharmacy subscription required.

## Team Mandate

Follow gstack workflow:
1. `/plan-eng-review` lock architecture
2. `/design-consultation` lock tokens/guardrails
3. `/plan-design-review` score screens 0–10
4. Build + `/review` + `/qa` + `/cso` + `/ship`

## Decisions Already Taken (No Need to Revisit)

- Stack: FlutterFlow + Xano
- Auth: WhatsApp OTP + Google OAuth (NOT Firebase Auth)
- Push: Firebase Cloud Messaging
- Maps: Google Maps + server-side Haversine
- Payments: Orange Money + Wave
- Design: No emoji, component-color status mapping, accessibility first
