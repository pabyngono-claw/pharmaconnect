# TC-09 Payment webhook replay

Status: manual

Steps:
Send same webhook payload twice with identical provider_transaction_id.

After:
```json
{"first": {"code": "ERROR_CODE_NOT_FOUND", "message": "Unable to locate request."}, "second": {"code": "ERROR_CODE_NOT_FOUND", "message": "Unable to locate request."}}
```

