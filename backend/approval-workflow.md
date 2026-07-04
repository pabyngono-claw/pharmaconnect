# Admin Approval Workflow — Implementation Guide

Source: docs/design-consultation.md, references/schema-full.md, docs/security-review.md

## Admin Dashboard Screens

### 1. Pending Pharmacies (List)
Fields: pharmacy_id, name, quartier, phone, submitted_at, documents count, approval_status.
Actions: Review, View documents.

### 2. Pharmacy Review (Detail)
Sections:
- Info: name, address, quartier, phone, registration_number
- Documents: list of 4 docs with status badge + preview
- Staff: list of linked users
- Approval actions: Approve pharmacy / Reject pharmacy / Reject document

### 3. Document Detail
Shows: file preview, status, review_note, reviewed_by, reviewed_at.
Actions: Approve document / Reject document + required note.

## Flow

1. Admin opens Pending Pharmacies list.
2. Selects pharmacy -> detail view.
3. Reviews each of 4 documents. Any document can be approved/rejected independently.
4. Once ALL 4 documents approved, pharmacy.approval_status becomes approvable.
5. Admin clicks "Approve pharmacy" -> approval_status = approved -> pharmacy.is_active = true -> notify pharmacy owner.
6. If pharmacy rejected -> approval_status = rejected -> notify owner with reason.

## Guardrails
- Admin cannot activate pharmacy unless all 4 documents approved.
- Cannot approve if already approved/suspended.
- Reject requires review_note on document or pharmacy.
- Actions logged in audit_logs with admin actor_user_id.

## Xano Implementation Hints
- Use a computed column on pharmacies: `all_documents_approved` boolean based on pharmacy_documents status aggregation.
- Add admin-only security rule on pharmacy mutation endpoints.
- Batch document approval can be a single Xano function taking pharmacy_id + array of document decisions.
