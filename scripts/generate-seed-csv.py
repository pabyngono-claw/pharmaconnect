#!/usr/bin/env python3
"""Generate minimal demo seed CSVs for Xano import."""
import csv
from pathlib import Path
from datetime import datetime, timedelta
import random
import uuid

out = Path("/home/deploy/pharmaconnect/backend/xano/seed-csv")
out.mkdir(parents=True, exist_ok=True)

NOW = datetime.utcnow()

def row(**kw):
    return kw

# organizations
with open(out / "organizations.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["id", "name", "registration_number", "created_at"])
    w.writeheader()
    w.writerow(row(id=str(uuid.uuid4()), name="Pharmacie de la Place", registration_number="REG-001", created_at=NOW.isoformat()))

# users
with open(out / "users.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["id", "phone", "email", "password_hash", "role", "is_verified", "metadata", "created_at", "updated_at"])
    w.writeheader()
    w.writerow(row(id=str(uuid.uuid4()), phone="+221****0001", email="", password_hash="", role="patient", is_verified=True, metadata="{}", created_at=NOW.isoformat(), updated_at=NOW.isoformat()))
    w.writerow(row(id=str(uuid.uuid4()), phone="+221****0002", email="", password_hash="", role="pharmacy", is_verified=True, metadata="{}", created_at=NOW.isoformat(), updated_at=NOW.isoformat()))
    w.writerow(row(id=str(uuid.uuid4()), phone="+221****0003", email="", password_hash="", role="admin", is_verified=True, metadata="{}", created_at=NOW.isoformat(), updated_at=NOW.isoformat()))

# pharmacies
org_id = None
with open(out / "organizations.csv", "r", newline="", encoding="utf-8") as f:
    r = next(csv.DictReader(f))
    org_id = r["id"]

with open(out / "pharmacies.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["id", "organization_id", "name", "address", "quartier", "lat", "lng", "phone", "approval_status", "is_active", "created_at", "updated_at"])
    w.writeheader()
    w.writerow(row(id=str(uuid.uuid4()), organization_id=org_id, name="Pharmacie de la Place", address="123 Ave de la République", quartier="Médina", lat="14.69280000", lng="-17.44670000", phone="+221****0002", approval_status="approved", is_active=True, created_at=NOW.isoformat(), updated_at=NOW.isoformat()))

# pharmacy_staff
pharmacy_id = None
with open(out / "pharmacies.csv", "r", newline="", encoding="utf-8") as f:
    r = next(csv.DictReader(f))
    pharmacy_id = r["id"]
user_id_pharmacy = None
with open(out / "users.csv", "r", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))
    user_id_pharmacy = rows[1]["id"]

with open(out / "pharmacy_staff.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["id", "pharmacy_id", "user_id", "role", "is_active", "created_at"])
    w.writeheader()
    w.writerow(row(id=str(uuid.uuid4()), pharmacy_id=pharmacy_id, user_id=user_id_pharmacy, role="owner", is_active=True, created_at=NOW.isoformat()))

# medicine_request
user_id_patient = None
with open(out / "users.csv", "r", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))
    user_id_patient = rows[0]["id"]

with open(out / "medicine_request.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["id", "patient_id", "prescription_images_count", "product_type", "notes", "quantity", "expires_at", "re_broadcast_suggested", "status", "created_at", "updated_at"])
    w.writeheader()
    exp = (NOW + timedelta(hours=72)).isoformat()
    w.writerow(row(id=str(uuid.uuid4()), patient_id=user_id_patient, prescription_images_count=0, product_type="prescription", notes="Doliprane 1000", quantity=2, expires_at=exp, re_broadcast_suggested=False, status="submitted", created_at=NOW.isoformat(), updated_at=NOW.isoformat()))

print("seed-csv generated at", out)
for p in sorted(out.glob("*.csv")):
    print(" -", p.name)
