# Design Consultation — PharmaConnect v2.0

Status: Locked
Date: 2026-07-03

## Brand Position

PharmaConnect must read: trustworthy pharmacy, modern logistics, clear until 80.
Tone should be calm, efficient, legible. Avoid playful or clinical-cold aesthetics.

## Design Tokens

### Colors
- Primary: `#0F5B6E` (deep teal)
- Secondary: `#FF7A00` (warm orange) — only used for single primary CTA
- Success: `#1D8A4B`
- Warning: `#C57B00`
- Error: `#C0392B`
- Info: `#2471A3`
- Neutral: `#4A5568`
- Neutral secondary: `#718096`
- Background: `#F7FAFC`
- Surface: `#FFFFFF`
- Border: `#E2E8F0`

### Typography
- Font family: Inter
- Base size: 16px
- Scale: 12, 14, 16, 18, 20, 24, 32, 40
- Line-height: 1.5 body, 1.25 headings
- Weights used: 400, 500, 600, 700

### Spacing
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64

### Radii
- Small: 6px
- Medium: 10px
- Large: 16px
- Full: 9999px

### Shadows
- xs: elevation 1
- sm: elevation 2
- md: elevation 4
- lg: elevation 8

### Motion
- Duration: 120ms micro, 200ms standard, 320ms emphasis
- Easing: ease-out standard, ease-in-out emphasis
- Respects prefers-reduced-motion

## Component-Color Status Mapping

Every enum/status must map to one consistent color/label pair.

Reservation/Request/Waiting list statuses:
- pending/waiting: warning color, label "En attente"
- submitted/sent: info color, label "Envoyee"
- viewed: neutral secondary, label "Consultee"
- responded: secondary, label "Reponse recue"
- reservable/reserved: success, label "Reserve"
- ready: success, label "Pret"
- served: success, label "Servi"
- rejected: error, label "Refuse"
- expired: neutral, label "Expire"
- cancelled: neutral, label "Annule"

Pharmacy approval:
- pending: info, "En attente"
- document_pending: warning, "Documents en attente"
- approved: success, "Approuvee"
- rejected: error, "Rejetee"

Subscription:
- trial: info, "Essai"
- active: success, "Actif"
- past_due: warning, "Retard"
- expired: neutral, "Expire"

UI states:
- loading: skeleton + animated shimmer
- error: red text + retry CTA, no toast-only
- empty: illustration + explanation + optional CTA
- offline: cached reads, writes disabled with "No connection"
- success: toast-like confirmation, but inline where possible

## Accessibility Standards

- Contrast >= 4.5:1 normal text, 3:1 large text
- Touch targets >= 48x48dp
- No fixed-height text containers
- Test at 2x system font size
- Screen-reader labels on image upload actions
- Loading skeleton rows must match real row layout

## Shared Components Standard Design

StatusBadge:
- Pill shape
- Status enum -> color/label map via component-color mapping above
- No emoji in labels

ResponseCard:
- Expandable body
- Primary CTA is disabled if already reserved
- Price shows TVA total, not raw unit price

RequestTimeline:
- Horizontal stepper
- Per-pharmacy status
- Overall request status also visible

DocumentUploadTile:
- Per-document upload progress
- Status badge
- Retry without full resubmit

EmptyState:
- Illustration
- Explanation
- Optional CTA

GardeBadge:
- Computes "on duty now" from garde_dates + datetime
- Green when on duty, gray when off

## Animation Principles

- CSS-only where possible
- Smooth 60fps
- Respect prefers-reduced-motion
- Skeleton: animated shimmer only on loading state
- No motion for status changes; use color + icon only

## No-Emoji Rule

Zero emoji in:
- UI labels
- Status badges
- Tabs, buttons, cards
- Notifications, emails, SMS
- Admin dashboard

Emoji has no place in a pharmacy data flow; text only.

## Responsive Breakpoints

- Mobile: 375px
- Tablet: 768px
- Desktop: 1280px
- Max width: 1280px center-aligned container

## Component Library Pattern

FlutterFlow custom components defined in this order of priority:
1. StatusBadge
2. ResponseCard
3. RequestTimeline
4. DocumentUploadTile
5. EmptyState
6. GardeBadge

Every component stored in `frontend/flutterflow/components/`.
Each has its own page-level snapshot in `references/components/`.
