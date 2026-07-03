# FlutterFlow Components — PharmaConnect v2.0

Build these components in the order listed. Each must match design tokens and component-color mapping.

## Component List

1. StatusBadge
2. ResponseCard
3. RequestTimeline
4. DocumentUploadTile
5. EmptyState
6. GardeBadge

## StatusBadge

UI spec:
- Pill shape, full border radius
- Background = status color at 15% opacity
- Border = status color at 40% opacity
- Text = status color at full opacity
- Padding: 4px 12px
- Font: 13px / 500 weight
- Min height: 28px

Behavior:
- Accepts `status` enum and optional locale
- No emoji in label
- If status unknown, renders neutral badge with label "Inconnu"

## ResponseCard

UI spec:
- Surface card with border: `border`
- Radius: `medium`
- Padding: `unit-4`
- Header row: pharmacy name + status badge + distance
- Expandable body: unit price, quantity, tva rate, total
- Primary CTA: "Reserver" using `secondary` color
- Reserved CTA: disabled, muted, label "Deja reserve"

Behavior:
- CTA disabled if reservation exists for user on same request
- Expanding body animates over 200ms ease-out

## RequestTimeline

UI spec:
- Horizontal stepper on desktop; vertical on mobile
- Each node = pharmacy avatar placeholder + status dot + distance
- Active step uses `primary`; completed uses `success`; pending uses `neutral`
- Label below each dot: pharmacy name truncated to 20 chars
- Overall request status bar above timeline

Behavior:
- Click node expands mini ResponseCard preview inline

## DocumentUploadTile

UI spec:
- Rounded card per document type
- Top row: document label + status badge
- Bottom row: upload button + preview thumbnail if exists
- Upload state = animated progress bar `color info`
- Approved/rejected badges use success/error colors

Behavior:
- Retry without losing already approved docs
- Validation: size <= 5MB, formats pdf/jpg/png

## EmptyState

UI spec:
- Centered illustration area max 200x200
- Title: 20px / 600 weight / `neutral`
- Body: 14px / 400 weight / `neutral-secondary`
- Optional CTA button centered below using `secondary`

## GardeBadge

UI spec:
- Small pill badge
- Green = on duty, Gray = off duty
- Label: "Garde" or "Hors garde"

Behavior:
- Computed from garde_dates + datetime.now()
- Updates on page load; no polling required for initial render

## Accessibility Checklist

- All interactive elements >= 48x48dp
- Labels present on every action button
- Loading state not announced as focus loss
- Expand/collapse uses `aria-expanded`
