# Screen Specs — PharmaConnect v2.0

## AUTH-01 Login / Verify OTP

### Purpose
User authenticates by phone OTP.

### Layout
- Logo + tagline
- Phone input with country code +237 prefix default, editable
- "Send OTP" primary CTA
- Error area below input if OTP invalid/rate limited
- Secondary CTA: "Continuer avec Google" using brand Google styling
- Footer: privacy note + terms link

### Validation
- Phone required, E.164 format enforced
- OTP: 6 digits numeric
- Cooldown display when rate-limited

### Data Contract
POST /auth/otp/request
POST /auth/otp/verify

## AUTH-02 OAuth Link

### Purpose
Link Google account after OTP login or during onboarding.

### Layout
- "Link Google" main action
- Status indicator: pending / linked / error

### Validation
- Existing Google account must not already be linked to another user

### Data Contract
POST /auth/link

## REQ-01 Request New

### Purpose
Patient submits prescription or product request.

### Layout
- Type selector: Prescription / Product / Equipment
- Notes textarea (multi-line)
- Quantity input (number) if Product/Equipment
- Image upload tile: max 5, compress to 1600px JPEG 80
- Expiry shown: "Valable 72h"
- Primary CTA: "Envoyer"

### Validation
- At least one image for prescription
- Notes required for product/equipment
- Offline: CTA disabled, inline "No connection" message

### Data Contract
POST /requests

## REQ-02 Pharmacy Selection + Responses

### Purpose
Patient sees nearest pharmacies and their responses.

### Layout
- Search bar with place autocomplete
- Sort: by distance / by price
- List cards: pharmacy name, distance, badge status (sent/viewed/responded)
- Expanded item shows ResponseCard inline

### Validation
- Empty state if no pharmacies online within 50km
- Skeleton while loading

### Data Contract
GET /requests/:id
GET /pharmacies/:id/requests?near=true

## PHARM-01 Document Upload

### Purpose
Pharmacy submits 4 business registration documents.

### Layout
- 4 tiles: business registration, pharmacy license, pharmacist diploma, owner ID
- Each tile: drop area, progress, status badge, retry without full resubmit
- Status bar: 0/4 approved
- Primary CTA: "Demander approbation"

### Validation
- PDF, JPG, PNG only
- Max 5MB per document
- Cannot submit until all 4 are pending

### Data Contract
POST /pharmacy-documents
PATCH /pharmacy-documents/:id

## PHARM-02 Request Response

### Purpose
Pharmacy responds to an incoming request.

### Layout
- Request summary: images carousel, notes, product type, expiry countdown
- Price input, quantity input
- Cached total preview: unit_price * quantity * (1 + tva_rate)
- CTA: "Repondre"

### Validation
- Price must be positive
- Quantity must be positive integer
- Half-open expiry warning when < 24h remains

### Data Contract
POST /responses

## ADMIN-01 Pharmacy Approval

### Purpose
Admin reviews and approves/rejects pharmacy documents.

### Layout
- Pharmacy header: name, address, approval status
- Document grid: preview + status badge + action buttons (approve/reject)
- Review reason textarea
- Primary CTA: "Publier" only when all 4 approved

### Validation
- Cannot partially approve and publish; all 4 must be approved
- Rejection requires non-empty review_note

### Data Contract
POST /pharmacy-documents/:id/approve
POST /pharmacy-documents/:id/reject
