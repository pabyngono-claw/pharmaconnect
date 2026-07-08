# FlutterFlow Screen Map — PharmaConnect v2.0

Route prefixes:
- Patient: `/` and `/requests`, `/reservations`, `/profile`
- Pharmacy: `/pharmacy`
- Admin: `/admin`

## PATIENT FLOW

### Screen: Login / OTP
- Route: `/login`
- Widgets: PhoneTextFormField, CountdownTimer, SendOtpButton
- Logic:
  - On tap Send OTP: call POST /auth/otp/request
  - On success: enable OTP field, start cooldown display
  - On verify: call POST /auth/otp/verify
  - Store tokens in SecureStorage
- Accessibility:
  - All buttons >= 48x48
  - Screen-reader labels on phone and OTP fields

### Screen: Request New
- Route: `/requests/new`
- Widgets: TypeSelector, NotesTextFormField, QuantityInput, ImageUploadGrid
- Logic:
  - Type selector changes visibility of quantity field
  - Image upload compresses client-side to 1600px JPEG 80
  - Offline detection: disable CTA, show inline message
  - On submit: POST /requests with images as first body
- Expiry display: "Valable 72h" below CTA

### Screen: Request Detail
- Route: `/requests/:id`
- Widgets: RequestHeader, ImagesCarousel, StatusBadge
- Pull to refresh triggers GET /requests/:id

### Screen: Pharmacy Selection
- Route: `/requests/:id/pharmacies`
- Widgets: SortToggle, SearchBar, PharmacyCard, ResponseCard
- Logic:
  - Sort by distance or price
  - Skeleton while loading
  - Empty state if no pharmacy within 50km
- Data: GET /pharmacies?near=true&responseId=:id

### Screen: Reservations
- Route: `/reservations/:id`
- Widgets: ReservationHeader, StatusBadge, PharmacyCard, SupportLink
- Pull to refresh GET /reservations/:id
- Cached local read before API hit

### Screen: Profile
- Route: `/profile`
- Widgets: UserCard, PushToggle, DeleteAccountButton
- Delete account:
  - Confirmation dialog
  - API call with 72h delay semantics if backend supports
- Push permission request only after login, not on app launch

## PHARMACY FLOW

### Screen: Pharma Login
- Route: `/pharmacy/login`
- Same AUTH-01 flow but after login reads staff role and redirects to dashboard

### Screen: Pharma Dashboard
- Route: `/pharmacy/dashboard`
- Widgets: ApprovalStatusCard, StatsRow, RequestsList
- Logic:
  - ApprovalStatusCard maps pharmacy.approval_status + pending docs count to actionable text
  - StatsRow shows: pending requests, opened responses of the day
- Data: GET /pharmacy/requests?status=... and GET /pharmacy/documents

### Screen: Pharma Document Upload
- Route: `/pharmacy/documents`
- Widgets: DocumentGridTile(4), ProgressBar, RequestApprovalButton
- Logic:
  - Each tile can re-upload without resetting sibling tiles
  - Status bar shows X/4 approved
  - CTA disabled if any tile still pending/uploading
  - Upload compresses client-side
- Data: POST /pharmacy-documents, PATCH /pharmacy-documents/:id

### Screen: Pharma Request Response
- Route: `/pharmacy/requests/:id`
- Widgets: RequestSummary(ImagesCarousel + Notes), PriceInput, QuantityInput, CachedTotalPreview, Cta
- Logic:
  - CachedTotalPreview = unit_price * quantity * (1 + tva_rate/100) from local calc
  - On submit: POST /responses with idempotency header
  - Show half-open expiry warning if hold_expires_at < 24h

### Screen: Waiting List
- Route: `/pharmacy/waiting-list`
- Widgets: WaitingCard(patient_name, queue_position, expiry), MarkServedButton
- Logic:
  - CTA changes waiting_lists.state to served
  - Promotes next in queue
- Data: GET /pharmacy/waiting-list

## ADMIN FLOW

### Screen: Admin Login
- Same patient login but later role-based redirect

### Screen: Admin Pharmacy Review
- Route: `/admin/pharmacies/:id/review`
- Widgets: PharmacyHeaderCard, DocumentGrid, ApproveButton, RejectButton, ReviewReasonTextField
- Logic:
  - CTA Publish disabled until all 4 approved
  - Rejection requires reason
- Data: POST /pharmacy-documents/:id/approve, /reject

### Screen: Admin Requests
- Route: `/admin/requests`
- Filters by status; opens detail in dialog

## Navigation Rules
- Patient stack: /login, /requests/new, /requests/:id, /reservations/:id, /profile
- Pharmacy stack: /pharmacy/login, /pharmacy/dashboard, /pharmacy/requests/:id, /pharmacy/waiting-list, /pharmacy/documents
- Admin stack: /admin/login, /admin/pharmacies, /admin/pharmacies/:id/review
- After auth success: resolve role and pushAndRemoveUntil role root
- After logout: clear SecureStorage tokens and go to /login

## Caching Strategy
- Requests/Reservations: cache policy = network first, then local cache
- Messages/Notifications: local first, background sync every 60s
- Image list: pagination cursor-based, 20 per page

## Offline Behavior
- Reads: show last cached state with banner "hors ligne"; background refresh
- Writes: disable mutation CTAs with "Pas de connexion" inline; do not queue silently
