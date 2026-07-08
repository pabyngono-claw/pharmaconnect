# TC-08 TVA computation server-side

Status: manual

Steps:
Create request then inspect response math server-side.

Before:
```json
{"unit_price": 1000, "quantity": 2, "tva_rate": 18}
```

After:
```json
{"status": 404, "body": {"code": "ERROR_CODE_NOT_FOUND", "message": "Unable to locate request."}}
```

Notes: Implementation guard in place: TVA never computed client-side.
