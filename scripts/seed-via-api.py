#!/usr/bin/env python3
"""Run PharmaConnect server-side tests using Xano API"""
import requests
import os
from pathlib import Path

PHARMA_DIR = Path("/home/deploy/pharmaconnect")
env_path = PHARMA_DIR / ".env"
vars = {}
for line in env_path.read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    if "=" in line:
        k, v = line.split("=", 1)
        vars[k.strip()] = v.strip()

XANO_API_URL = vars["XANO_API_URL"]
XANO_TOKEN = vars["XANO_API_TOKEN"]
headers = {"Authorization": f"Bearer {XANO_TOKEN}", "Content-Type": "application/json"}

health = requests.get(XANO_API_URL + "/health", headers=headers, timeout=20)
print("health", health.status_code, health.text[:200])

otp = requests.post(XANO_API_URL + "/auth/otp/request", headers=headers, timeout=20, json={"phone": "+221770000001"})
print("otp", otp.status_code, otp.text[:200])

if otp.status_code == 200:
    import re
    m = re.search(r'"masked_phone"\s*:\s*"([^"]+)"', otp.text)
    masked = m.group(1) if m else "+221770000001"
    verify = requests.post(XANO_API_URL + "/auth/otp/verify", headers=headers, timeout=20, json={"phone": "+221770000001", "code": "123456"})
    print("verify", verify.status_code, verify.text[:300])
