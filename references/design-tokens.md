# Design Tokens — PharmaConnect v2.0

Source: docs/design-consultation.md

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| primary | #0F5B6E | Headers, nav, primary actions |
| secondary | #FF7A00 | Single primary CTA |
| success | #1D8A4B | Confirmed / ready / served |
| warning | #C57B00 | Waiting / attention |
| error | #C0392B | Rejected / destructive |
| info | #2471A3 | Informational / neutral progress |
| neutral | #4A5568 | Body text |
| neutral-secondary | #718096 | Muted text |
| background | #F7FAFC | Page background |
| surface | #FFFFFF | Cards, sheets |
| border | #E2E8F0 | Dividers, inputs |

## Typography

| Token | Value |
|-------|-------|
| font-family | Inter |
| base-size | 16px |
| scale-12 | 12px |
| scale-14 | 14px |
| scale-16 | 16px |
| scale-18 | 18px |
| scale-20 | 20px |
| scale-24 | 24px |
| scale-32 | 32px |
| scale-40 | 40px |
| line-height-body | 1.5 |
| line-height-heading | 1.25 |
| weight-regular | 400 |
| weight-medium | 500 |
| weight-semibold | 600 |
| weight-bold | 700 |

## Spacing

| Token | Value |
|-------|-------|
| unit-1 | 4px |
| unit-2 | 8px |
| unit-3 | 12px |
| unit-4 | 16px |
| unit-6 | 24px |
| unit-8 | 32px |
| unit-12 | 48px |
| unit-16 | 64px |

## Radii

| Token | Value |
|-------|-------|
| small | 6px |
| medium | 10px |
| large | 16px |
| full | 9999px |

## Shadows / Elevation

| Token | Elevation |
|-------|-----------|
| xs | 1 |
| sm | 2 |
| md | 4 |
| lg | 8 |

## Motion

| Token | Value |
|-------|-------|
| duration-micro | 120ms |
| duration-standard | 200ms |
| duration-emphasis | 320ms |
| easing-standard | ease-out |
| easing-emphasis | ease-in-out |

## Breakpoints

| Name | Width |
|------|-------|
| mobile | 375px |
| tablet | 768px |
| desktop | 1280px |
| max-width | 1280px |

## Component Color Mapping

Status enum -> color token + label

- reserved / active / ready / served -> success / "Pret" / "Servi"
- submitted / sent -> info / "Envoyee"
- viewed -> neutral-secondary / "Consultee"
- responded -> secondary / "Reponse recue"
- pending/waiting -> warning / "En attente"
- rejected -> error / "Refuse"
- expired -> neutral / "Expire"
- cancelled -> neutral / "Annule"
- pharmacy approved -> success / "Approuvee"
- pharmacy pending -> info / "En attente"
- document pending -> warning / "Documents en attente"
- subscription trial -> info / "Essai"
- subscription active -> success / "Actif"
- subscription past_due -> warning / "Retard"
- subscription expired -> neutral / "Expire"

## Shared Components Standard Design

### StatusBadge
Pill shape. Enum -> color + label via mapping above. No emoji.

### ResponseCard
Expandable. Reserve CTA disabled if already reserved. Price shows TVA total only.

### RequestTimeline
Horizontal stepper. Per-pharmacy status + overall request status.

### DocumentUploadTile
Upload progress + status badge. Retry without full resubmit.

### EmptyState
Illustration + explanation + optional CTA.

### GardeBadge
"on duty now" computed from garde_dates + datetime. Green on, gray off.

## Accessibility

- Contrast >= 4.5:1 normal, 3:1 large
- Touch >= 48x48dp
- No fixed-height text containers
- 2x system font size supported
- Screen-reader labels on image upload actions
- Skeleton rows match real row layout

## No-Emoji Rule

Zero emoji in:
- UI labels
- Status badges
- Tabs/buttons/cards
- Notifications/emails/SMS
- Admin dashboard
