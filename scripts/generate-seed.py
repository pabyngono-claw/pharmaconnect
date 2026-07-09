#!/usr/bin/env python3
"""Generate deterministic PharmaConnect demo seed data for Xano."""
import uuid
from pathlib import Path
from datetime import datetime

PHARMA_DIR = Path("/home/deploy/pharmaconnect")
SEED_DIR = PHARMA_DIR / "backend" / "xano" / "seed"


def deterministic_uuid(seed: str) -> str:
    val = uuid.uuid5(uuid.NAMESPACE_DNS, seed)
    return str(val)


def write(name: str, body: str):
    path = SEED_DIR / name
    path.write_text(body.strip() + "\n", encoding="utf-8")
    print(path)


def main():
    org_a = deterministic_uuid("org-a")
    org_b = deterministic_uuid("org-b")
    pharm_a = deterministic_uuid("pharm-a")
    pharm_b = deterministic_uuid("pharm-b")
    staff_a = deterministic_uuid("staff-a")
    staff_b = deterministic_uuid("staff-b")
    staff_c = deterministic_uuid("staff-c")
    patient_a = deterministic_uuid("patient-a")
    patient_b = deterministic_uuid("patient-b")
    patient_c = deterministic_uuid("patient-c")
    request_a = deterministic_uuid("request-a")
    reservation_a = deterministic_uuid("reservation-a")
    doc_a = deterministic_uuid("doc-a")
    sub_a = deterministic_uuid("sub-a")

    write("01-organization.sql", f"""
INSERT INTO organizations (id, name, country_code, region, created_at)
VALUES
  ('{org_a}', 'Pharma Group A', 'SN', 'Dakar', '2025-01-01T00:00:00Z'),
  ('{org_b}', 'Pharma Group B', 'SN', 'Thies', '2025-01-01T00:00:00Z');

INSERT INTO pharmacies (id, organization_id, name, lat, lng, active, created_at)
VALUES
  ('{pharm_a}', '{org_a}', 'Pharmacie Test A', 14.7167, -17.4677, true, '2025-01-01T00:00:00Z'),
  ('{pharm_b}', '{org_b}', 'Pharmacie Test B', 14.79, -17.38, true, '2025-01-01T00:00:00Z');
""")

    write("02-users.sql", f"""
INSERT INTO users (id, phone, name, role, created_at)
VALUES
  ('{staff_a}', '+221770000001', 'Pharmacien A', 'pharmacy', '2025-01-01T00:00:00Z'),
  ('{staff_b}', '+221770000002', 'Pharmacien B', 'pharmacy', '2025-01-01T00:00:00Z'),
  ('{staff_c}', '+221770000003', 'Admin A', 'admin', '2025-01-01T00:00:00Z'),
  ('{patient_a}', '+221770000004', 'Patient A', 'patient', '2025-01-01T00:00:00Z'),
  ('{patient_b}', '+221770000005', 'Patient B', 'patient', '2025-01-01T00:00:00Z'),
  ('{patient_c}', '+221770000006', 'Patient C', 'patient', '2025-01-01T00:00:00Z');
""")

    write("03-documents.sql", f"""
INSERT INTO pharmacy_documents (id, pharmacy_id, document_type, status, created_at)
VALUES
  ('{doc_a}', '{pharm_a}', 'kbis', 'pending', '2025-01-01T00:00:00Z');
""")

    write("04-active-flow.sql", f"""
INSERT INTO requests (id, patient_id, product_type, notes, quantity, status, created_at)
VALUES
  ('{request_a}', '{patient_a}', 'product', 'Doliprane 1000mg x2', 2, 'submitted', now());

INSERT INTO reservations (id, request_id, pharmacy_id, status, created_at)
VALUES
  ('{reservation_a}', '{request_a}', '{pharm_a}', 'reserved', now());
""")

    write("05-subscriptions.sql", f"""
INSERT INTO pharmacy_approval_status (pharmacy_id, status, note, created_at)
VALUES
  ('{pharm_a}', 'pending', 'Attente documents', now());
""")

    print("generated seed data with deterministic uuid5")


if __name__ == "__main__":
    main()
