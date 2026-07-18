# PharmaConnect -- Pharmacy Reservation Detail Build Guide

**FlutterFlow build instructions for Screen 15/21**  
Role: **Pharmacy**  
Authentication: **Bearer + pharmacy scope**

---

## 1. API Call Setup

| API Call Name | Method | Path | Backend status |
|---|---|---|---|
| `get_pharmacy_reservation` | `GET` | `/reservations/{{reservation_id}}` | BACKEND GAP |
| `mark_reservation_ready` | `POST` | `/reservations/{{reservation_id}}/mark-ready` | Confirmed |
| `mark_reservation_served` | `POST` | `/reservations/{{reservation_id}}/mark-served` | Confirmed |

**Base URL:** Xano project environment variable.  
**Authorization:** `Authorization: Bearer {{FFAppState().accessToken}}`  
**Writes:** Generate a UUID v4 `Idempotency-Key`, set `Content-Type: application/json`, and disable duplicate taps.

Do not create JSON paths until the endpoint has been tested in Xano. Calls marked `[BACKEND GAP]` are placeholders only.

---

## 2. Page Setup

| Property | Value |
|---|---|
| Page name | `PharmacyReservationDetailScreen` |
| Background | `#F8FAFC` |
| Safe area | Enabled |
| Minimum touch target | 48 x 48 dp |
| Error language | Friendly French |

### Page parameters

| Name | Type | Requirement |
|---|---|---|
| `reservation_id` | String | Required |

---

## 3. Page State

Create: `isLoading`, `isSubmitting`, `hasError`, `errorMessage`, `isOffline`, `selectedRecordId`, and `cachedPayload`. Add page-specific filter, form, tab, and selection variables as needed.

---

## 4. Widget Tree

```text
Page (PharmacyReservationDetailScreen)
+-- SafeArea
    +-- Stack
    +-- Status header
    +-- Patient/reservation card
    +-- Items and totals
    +-- Timeline
    +-- Mark Ready
    +-- Mark Served
    +-- Conditional loading layer
    +-- Conditional error/empty layer
```

Use reusable components for cards, status chips, confirmation dialogs, error panels and loading skeletons.

---

## 5. Data Binding

1. Bind lists to tested Xano arrays.
2. Bind cards to the current repeated item.
3. Pass IDs through typed page parameters.
4. Format CFA values and local timestamps consistently.
5. Use conditional visibility based on backend status.
6. Cache the last successful read where offline display is required.
7. Never bind to an unconfirmed field.

---

## 6. Actions

1. Load
2. Confirm Ready
3. Confirm Served
4. Refresh

Standard flow:

```text
Set loading/submitting true
Call API
Success -> update state, clear error, refresh affected data
401 -> clear tokens and Replace navigation to Login
403 -> show access denied
Other error -> friendly message + Réessayer
Finally -> loading/submitting false
```

---

## 7. UI States

- **Pending**
- **Confirmed**
- **Ready**
- **Served**
- **Cancelled**
- **Expired**
- **Error**
- **401/403 redirect**

---

## 8. Validation and Safety

- Validate required fields before writes.
- Block negative quantities and prices.
- Confirm destructive/final status actions.
- Do not expose patient or pharmacy-private data outside its role.
- Refresh from Xano after every successful mutation.
- Never display raw backend errors.

---

## 9. Test Checklist

| # | Scenario | Result |
|---|---|---|
| 1 | Correct record/data loads | Pass |
| 2 | Navigation passes correct IDs | Pass |
| 3 | Loading state displays | Pass |
| 4 | Empty state displays when applicable | Pass |
| 5 | Error state shows friendly French | Pass |
| 6 | 401 clears tokens and redirects | Pass |
| 7 | 403 protects role scope when applicable | Pass |
| 8 | Write buttons disable while submitting | Pass |
| 9 | Successful writes refresh data | Pass |
| 10 | No unsupported field is invented | Pass |

---

## 10. Verification

- [ ] Page and parameters match the screen specification
- [ ] API names are unique
- [ ] Base URL uses environment configuration
- [ ] Bearer header is applied only when required
- [ ] Idempotency key is present on writes
- [ ] Loading, empty, success and error states work
- [ ] 401 and 403 behavior is correct
- [ ] Duplicate writes are prevented
- [ ] Successful writes refresh visible data
- [ ] All tests pass in FlutterFlow Run mode

---

## 11. Backend Gaps

- [BACKEND GAP] GET /reservations/:id and pharmacy reject/cancel are absent.
