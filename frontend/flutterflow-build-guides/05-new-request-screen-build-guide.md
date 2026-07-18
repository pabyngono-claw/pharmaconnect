# PharmaConnect -- New Request Screen Build Guide

**FlutterFlow build instructions for Screen 5/21**
Source of truth: `frontend/screens/05-new-request-screen.md`

---

## 1. API Call Setup

**Menu:** Settings & Integrations -> API Calls -> + Add API

### API Call: `create_request`

| Field | Value |
|-------|-------|
| **API Call Name** | `create_request` |
| **Method** | `POST` |
| **Base URL** | Your Xano workspace URL |
| **Path** | `/requests` |
| **Headers** | `Content-Type: application/json`, `Authorization: Bearer {{app_state.access_token}}`, `Idempotency-Key: {{page_state.idempotency_key}}` |
| **Body** | `{ "product_type": "{{widget.product_type}}", "notes": "{{widget.notes}}", "quantity": {{widget.quantity}}, "images": {{widget.images_json}}, "metadata": {{widget.metadata_json}} }` |

Define response variables:

| Variable Name | Type | JSON Path |
|---------------|------|-----------|
| `api_request_id` | String | `request_id` |
| `api_expires_at` | String | `expires_at` |

**Test tab**: Set a valid Bearer token + UUIDv4 Idempotency-Key header. Expected: 200 with `{ "request_id": "...", "expires_at": "..." }`.

---

## 2. Page Setup

| Property | Value |
|----------|-------|
| **Page Name** | `NewRequestScreen` |
| **Page Title** | `Nouvelle demande` |
| **Background Color** | `#F8FAFC` |
| **Safe Area** | Enabled |

---

## 3. Widget Tree

```
Page (NewRequestScreen)
+-- Column (scrollable)
    +-- Row (header)
    |   +-- IconButton (arrow_back, On Tap -> Navigate Back)
    |   +-- Text ("Nouvelle demande", Size: 20, Weight: bold, Color: #0F5B6E)
    +-- SizedBox (height: 16)
    +-- SegmentedButton (request type)
    |   +-- Segment 1: "Ordonnance" (prescription)
    |   +-- Segment 2: "Medicament" (product)
    |   +-- Segment 3: "Equipement" (equipment)
    |   +-- Selected Color: #0F5B6E, Unselected: #E5E7EB
    +-- SizedBox (height: 24)
    +-- Column (dynamic form -- conditional on type)
    |   +-- [IF prescription] ImagePicker
    |   |   +-- Max Images: 1, Label: "Photo de l'ordonnance"
    |   |   +-- Accepted: JPEG, PNG, Max 5MB
    |   +-- [IF prescription] TextField (notes)
    |   |   +-- Label: "Notes supplementaires", Hint: "Posologie, urgence..."
    |   +-- [IF product] TextField (product_name)
    |   |   +-- Label: "Nom du medicament", Required: true
    |   +-- [IF product] TextField (dosage)
    |   |   +-- Label: "Dosage (ex: 500mg)"
    |   +-- [IF product] TextField (brand_preference)
    |   |   +-- Label: "Marque preferee (optionnel)"
    |   +-- [IF product] Switch (substitution_allowed)
    |   |   +-- Label: "Substitution autorisee", Default: true
    |   +-- [IF product] ImagePicker
    |   |   +-- Max Images: 3, Label: "Photos (optionnel)"
    |   +-- [IF equipment] TextField (equipment_name)
    |   |   +-- Label: "Nom de l'equipement", Required: true
    |   +-- [IF equipment] TextField (equipment_notes)
    |   |   +-- Label: "Descriptif / reference"
    |   +-- [ALL types] TextField (quantity)
    |       +-- Label: "Quantite", Keyboard: number, Min: 1
    +-- SizedBox (height: 16)
    +-- TextField (notes -- general)
    |   +-- Label: "Notes", Max Lines: 3, Hint: "Informations complementaires..."
    +-- SizedBox (height: 24)
    +-- ImagePicker (general images, all types)
    |   +-- Max Images: 5, Label: "Pieces jointes (optionnel)"
    +-- SizedBox (height: 16)
    +-- Card (pharmacy selection summary)
    |   +-- Text: "Selection des pharmacies" (Size: 14, Weight: bold)
    |   +-- Text: "Les plus proches seront notifiees automatiquement" (Size: 12, Color: #6B7280)
    +-- SizedBox (height: 32)
    +-- ElevatedButton (submit)
        +-- Text: "Envoyer la demande"
        +-- Color: #0F5B6E
        +-- Width: fill, Height: 48
        +-- On Tap -> Submit Action Chain
```

---

## 4. Data Binding

**Image upload routing:**
1. On image selected -> Upload to Xano File Storage via `POST /file/upload` (Xano built-in)
2. Store returned URL in Page State `uploaded_images[]`
3. Before submit, serialize `uploaded_images` to JSON array `[{url: "..."}]`

**Images JSON (for API body):**
```
Page State variable images_json = "[{\"url\": \"...\", \"sort\": 0}, {\"url\": \"...\", \"sort\": 1}]"
```
Build this in a Custom Action or via Widget State serialization.

---

## 5. States

### 5.1 Initial Form
- SegmentedButton default: or "Medicament"
- All fields empty, submit button active but guarded

### 5.2 Validation Errors
When submit tapped and validation fails:

```
Banner (below header, Color: #FEF3C7 border, #92400E text)
+-- Text: specific error message (e.g. "Veuillez indiquer le nom du medicament")
```

Validate before API call:
- Type must be selected
- At least one meaningful item (name OR image) provided
- Quantity > 0 if entered
- Image files <5MB, JPEG/PNG only

### 5.3 Uploading Attachments
```
Overlay on image area:
+-- CircularProgressIndicator (Size: 24, Color: #0F5B6E)
+-- Text ("Telechargement...", Size: 13, Color: #6B7280)
```

### 5.4 Submitting
```
Disable submit button
+-- Replace text with "Envoi en cours..."
+-- Show LinearProgressIndicator below button
```

### 5.5 Success
```
On 200 response:
+-- Set App State: last_created_request_id = api_request_id
+-- Navigate To -> RequestDetailScreen
  +-- Parameter: request_id = api_request_id
  +-- Type: Replace
```

### 5.6 Submission Failure
```
Banner (Color: #FEE2E2, Text Color: #991B1B)
+-- Text: "Echec de l'envoi. " + friendly message from error body
+-- ElevatedButton ("Reessayer") -- re-enables submit flow
Re-enable submit button
```

### 5.7 Expired Session (401)
```
On API Error (401):
  1. Set App State: is_logged_in = false, access_token = ""
  2. Navigate To -> LoginScreen (Replace)
```

---

## 6. Page Actions (On Submit)

```
Submit Button -> On Tap:
  +-- Step 1: Generate UUID
  |     +-- Set Page State: idempotency_key = UUID v4 (via Custom Action or Widget State)
  +-- Step 2: Serialize images
  |     +-- Set Page State: images_json = serialize(uploaded_images)
  +-- Step 3: Validate form
  |     +-- Conditional:
  |         - If type not selected -> Show validation error, STOP
  |         - If no item name + no images -> Show validation error, STOP
  |         - If quantity <= 0 when entered -> Show validation error, STOP
  +-- Step 4: Call API
        +-- Call: create_request
        +-- On Success: navigate to RequestDetailScreen(request_id)
        +-- On Error (401): navigate to LoginScreen
        +-- On Error (other): show failure banner
```

---

## 7. Page State Variables

| Name | Type | Default |
|------|------|---------|
| `selected_type` | String | `product` |
| `uploaded_images` | List<String> | `[]` |
| `images_json` | String | `[]` |
| `idempotency_key` | String | `""` |
| `product_name` | String | `""` |
| `dosage` | String | `""` |
| `brand_preference` | String | `""` |
| `substitution_allowed` | Boolean | `true` |
| `equipment_name` | String | `""` |
| `quantity` | Integer | `1` |
| `notes` | String | `""` |
| `is_submitting` | Boolean | `false` |

---

## 8. Custom Action: `generate_uuid_v4`

```
Name: generate_uuid_v4
Return Type: String
Code:
  import 'dart:math';
  String generateUuidV4() {
    final rng = Random();
    return '${_hex(8)}-${_hex(4)}-4${_hex(3)}-${_hex(1)}${['8','9','a','b'][rng.nextInt(4)]}${_hex(3)}-${_hex(12)}';
  }
  String _hex(int len) => List.generate(len, (_) => rng.nextInt(16).toRadixString(16)).join();
```

---

## 9. Test Checklist

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Create prescription request | Select Ordonnance, add image, submit | Navigates to Request Detail with new request_id |
| 2 | Create product request | Select Medicament, enter name + dosage, submit | Request created successfully |
| 3 | Validation blocks empty | Select product, leave name blank, tap submit | Error banner: "Veuillez indiquer le nom du medicament" |
| 4 | Negative quantity blocked | Enter quantity -1, submit | Error banner: quantity validation |
| 5 | Image upload flow | Select image 6MB | Error, file too large |
| 6 | Idempotency key sent | Submit twice rapidly | Second submission uses new idempotency_key, not duplicate |
| 7 | Submit button disabled during sending | Tap submit, observe | Button shows "Envoi en cours..." with spinner |
| 8 | Success navigation | Submit valid request | Navigated to Request Detail showing new request |
| 9 | API error | Submit with bad data triggering backend error | Failure banner with retry button visible |
| 10 | Expired session | Let token expire, then submit | Redirected to Login |
| 11 | Type switching | Toggle between 3 types | Correct fields appear for each type |

---

## 10. Verification

- [ ] API Call `create_request` configured with Bearer, Idempotency-Key, and proper body mapping
- [ ] Three product types selectable via SegmentedButton
- [ ] Conditional fields appear correctly per type
- [ ] Image upload -> Xano file storage works
- [ ] images_json serialized before submit
- [ ] UUID v4 generated fresh per submit (via Custom Action)
- [ ] Validation banner appears on invalid forms
- [ ] Submit disabled with "Envoi en cours..." during API call
- [ ] Success -> navigate to RequestDetailScreen with request_id
- [ ] 401 -> redirect to Login
- [ ] Error banner shows user-friendly message + retry
- [ ] All 11 test scenarios pass