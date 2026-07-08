# TC-01 OTP rate limiting

Status: manual

Steps:
Sent 5 OTP requests to same phone; observed 5th response.

Before:
```json
{"attempts": 5}
```

After:
```json
[{"i": 0, "code": 404, "body": {"code": "ERROR_CODE_NOT_FOUND", "message": "Unable to locate request."}}, {"i": 1, "code": 404, "body": {"code": "ERROR_CODE_NOT_FOUND", "message": "Unable to locate request."}}, {"i": 2, "code": 404, "body": {"code": "ERROR_CODE_NOT_FOUND", "message": "Unable to locate request."}}, {"i": 3, "code": 404, "body": {"code": "ERROR_CODE_NOT_FOUND", "message": "Unable to locate request."}}, {"i": 4, "code": 404, "body": {"code": "ERROR_CODE_NOT_FOUND", "message": "Unable to locate request."}}]
```

Notes: Auto-checked code==429 on 5th call.
