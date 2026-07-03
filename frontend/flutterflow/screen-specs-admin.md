# ADMIN-02 Pharmacy Approval

### Purpose
Admin reviews pharmacy documents and approves/rejects them.

### Layout
- Pharmacy header: name, address, phone, approval_status
- Document grid: 4 tiles with preview + status badge
- Review pane: approve/reject buttons + optional review_note
- Bulk action: request resubmit for rejected docs only

### Validation
- Cannot approve unless all 4 documents pending/approved
- Rejection requires note > 0 chars
- Resubmit allowed only for rejected docs

### Data Contract
POST /pharmacy-documents/:id/approve
POST /pharmacy-documents/:id/reject

## ADMIN-03 Support Tickets

### Purpose
Triaged ticket queue.

### Layout
- Tier badge + status badge
- Subject / body preview
- Assignee dropdown
- Close / reopen actions

### Validation
- Cannot assign tier3 without admin role
- Cannot close without resolution note

### Data Contract
PATCH /support-tickets/:id

## ADMIN-04 Subscription Oversight

### Purpose
Monitor pharmacy subscription health.

### Layout
- Subscription rows: plan, status, renewal, past_due countdown
- Actions: extend trial, cancel, mark paid

### Validation
- Extend trial only on active/trial
- Mark paid requires payment_transaction_id reference

### Data Contract
PATCH /subscriptions/:id
