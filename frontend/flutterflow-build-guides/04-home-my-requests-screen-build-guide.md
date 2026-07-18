# PharmaConnect -- Home / My Requests Screen Build Guide

**FlutterFlow build instructions for Screen 4/21**
Source of truth: `frontend/screens/04-home-my-requests-screen.md`

---

## 1. API Call Setup

**Menu:** Settings & Integrations -> API Calls -> + Add API

### API Call: `get_patient_requests`

| Field | Value |
|-------|-------|
| **API Call Name** | `get_patient_requests` |
| **Method** | `GET` |
| **Base URL** | Your Xano workspace URL |
| **Path** | `/requests?status=submitted` |
| **Headers** | `Authorization: Bearer {{app_state.access_token}}` |

**Variables tab** -- define response variables:

| Variable Name | Type | JSON Path |
|---------------|------|-----------|
| `api_requests` | List<Map> | `items` |
| `api_total` | Integer | `total` |

**Test tab**: Set a valid Bearer token in headers. Expected: 200 with `{ "items": [...], "total": N }`.

---

## 2. Page Setup

| Property | Value |
|----------|-------|
| **Page Name** | `HomeScreen` |
| **Page Title** | `Mes demandes` |
| **Background Color** | `#F8FAFC` |
| **Safe Area** | Enabled |
| **Loading Placeholder** | None |

---

## 3. Widget Tree

```
Page (HomeScreen)
+-- Column
    +-- Row (header)
    |   +-- Text ("Mes demandes")
    |   |   +-- Size: 24, Weight: bold, Color: #0F5B6E
    |   +-- IconButton (notifications)
    |       +-- Icon: notifications, Color: #0F5B6E
    |       +-- On Tap -> Navigate To -> NotificationsScreen
    +-- ListView (primary list)
    |   +-- Card (request card -- repeat from api_requests)
    |       +-- Row
    |           +-- Column
    |           |   +-- Text (product type, Weight: bold, Size: 16)
    |           |   +-- Text (created date, Size: 12, Color: #9CA3AF)
    |           +-- Column (end-aligned)
    |               +-- Chip (status, Color: #0F5B6E/10, Text: #0F5B6E)
    |               +-- Text ("3 reponses", Size: 12, Color: #10B981) -- only when response count > 0
    +-- FloatingActionButton
        +-- Icon: add
        +-- Color: #0F5B6E
        +-- On Tap -> Navigate To -> NewRequestScreen
```

---

## 4. Data Binding

**ListView -> Generate from variable:**

| Property | Value |
|----------|-------|
| **Source** | API Response (list_patient_requests) |
| **Data Source** | `api_requests` |
| **Number of items** | `api_requests.length` |

**Card tap handler:**

```
On Tap -> Navigate To -> RequestDetailScreen
  -> Send Parameter: request_id = api_requests[index].id
```

---

## 5. States

### 5.1 Loading

When page loads (Before query executes), show:
- 3 skeleton cards: Grey rounded rectangles (200x80dp each)
- Spacer height: 12dp between skeletons

**Widget:** FlutterFlow "ShimmerContainer" or manual:
```
Column
  +-- SkeletonCard (height: 80, color: #E5E7EB, borderRadius: 12)
  +-- SizedBox (height: 12)
  +-- SkeletonCard (height: 80, color: #E5E7EB, borderRadius: 12)
  +-- SizedBox (height: 12)
  +-- SkeletonCard (height: 80, color: #E5E7EB, borderRadius: 12)
```

### 5.2 Empty

When `api_requests` is empty or null:

```
Column (center-aligned)
  +-- Icon (pharmacy_outlined, Size: 64, Color: #9CA3AF)
  +-- SizedBox (height: 16)
  +-- Text ("Aucune demande en cours", Size: 18, Color: #374151)
  +-- SizedBox (height: 8)
  +-- Text ("Creez votre premiere demande de medicament", Size: 14, Color: #6B7280, TextAlign: center)
  +-- SizedBox (height: 24)
  +-- ElevatedButton
      +-- Text ("Nouvelle demande")
      +-- Color: #0F5B6E
      +-- On Tap -> Navigate To -> NewRequestScreen
```

### 5.3 Error

When API call fails (non-200):

```
Column (center-aligned)
  +-- Icon (error_outline, Size: 48, Color: #EF4444)
  +-- SizedBox (height: 12)
  +-- Text ("Impossible de charger vos demandes", Size: 16, Color: #374151)
  +-- SizedBox (height: 8)
  +-- Text (friendly error message, Size: 13, Color: #6B7280)
  +-- SizedBox (height: 16)
  +-- OutlinedButton
      +-- Text ("Reessayer")
      +-- On Tap -> Refresh API call
```

### 5.4 Offline

If backend unreachable but previous data cached:

```
Banner (top, sticky, Color: #F59E0B/10)
  +-- Text ("Mode hors ligne - donnees non actualisees", Size: 12, Color: #F59E0B)
ListView (same as success, data from local Page State cache)
```

### 5.5 Expired Session

When API returns 401:

```
On API Error (status 401):
  1. Set App State: is_logged_in = false, access_token = ""
  2. Navigate To -> LoginScreen (Replace)
```

---

## 6. Page Actions (On Page Load)

```
On Page Load
  +-- Step 1: Call API
  |     +-- Call: list_patient_requests
  |     +-- On Success: Set Page State cached_requests = api_requests
  |     +-- On Error (401): Navigate To LoginScreen
  |     +-- On Error (other): show Error state
  +-- Step 2: Conditional (optional)
        +-- If api_requests is empty: show Empty state
```

---

## 7. Page State Variables

| Name | Type | Default |
|------|------|---------|
| `cached_requests` | List<Map> | `[]` |
| `is_loading` | Boolean | `true` |

---

## 8. Pull-to-Refresh

Enable Pull-to-Refresh on the ListView:

| Property | Value |
|----------|-------|
| Refresh Indicator Type | Material (circular) |
| Refresh Color | `#0F5B6E` |
| On Refresh | Re-call `list_patient_requests` then update `cached_requests` |

---

## 9. Test Checklist

|| # | Scenario | Steps | Expected Result |
||---|----------|-------|-----------------|
| 1 | Authenticated patient loads Home | login as patient, navigate to Home | List of submitted requests appears |
| 2 | Empty list | new patient with no requests | Empty state with CTA is shown |
| 3 | Active requests sorted | create 3 requests at different times, refresh | newest appears first |
| 4 | Response count | view request with 2 pharmacy responses | "2 reponses" chip visible |
| 5 | Pull-to-refresh | pull down from top of list | spinner appears, list refreshes |
| 6 | Card navigation | tap a request card | Opens Request Detail with correct ID |
| 7 | FAB navigation | tap Nouvelle demande FAB | Opens New Request form |
| 8 | Expired session | login, wait 15+ min, refresh | Redirected to Login screen |
| 9 | Bottom nav | tap each tab | Navigate to Reservations, Notifications, Profile |
| 10 | Error state | disconnect backend before loading | Error text + Reessayer button visible |

---

## 10. Verification

- [ ] API Call `list_patient_requests` configured with Bearer header
- [ ] ListView bound to `api_requests`
- [ ] Skeleton loading state visible during API call
- [ ] Empty state with CTA when no requests
- [ ] Error state with retry button
- [ ] 401 -> redirect to Login
- [ ] Pull-to-refresh functional
- [ ] Cards pass correct `id` to Request Detail
- [ ] FAB opens New Request screen
- [ ] Bottom navigation present (debug in Run mode)
- [ ] All 10 tests pass on device/emulator