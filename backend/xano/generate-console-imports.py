#!/usr/bin/env python3
"""Split schema.sql into console-ready SQL chunks and write xano-import-guide.md."""
from pathlib import Path

pharma_dir = Path("/home/deploy/pharmaconnect")
schema_path = pharma_dir / "backend" / "xano" / "schema.sql"
out_dir = pharma_dir / "backend" / "xano" / "console-import"
out_dir.mkdir(parents=True, exist_ok=True)

text = schema_path.read_text(encoding="utf-8")
parts = {
    "01-enums": "-- ENUMS",
    "02-tables": "-- TABLES",
    "03-indexes": "-- INDEXES",
    "04-triggers": "-- TRIGGERS",
}
# crude split by comment headers present in schema.sql
chunks = {}
for key, marker in parts.items():
    start = text.index(marker)
    end = len(text)
    for other_key, other_marker in parts.items():
        if other_key == key:
            continue
        try:
            idx = text.index(other_marker, start + 1)
            end = min(end, idx)
        except ValueError:
            pass
    body = text[start:end].strip() + "\n"
    chunks[key] = body
    (out_dir / f"{key}.sql").write_text(body, encoding="utf-8")

guide = """# Xano Console Import Guide — PharmaConnect v2.0

Use `console-import/*.sql` when pasting into Xano Console Database Query panel.
Run in order: 1 -> 2 -> 3 -> 4. Execute each block individually."""
(out_dir / "xano-import-guide.md").write_text(guide, encoding="utf-8")

print(out_dir)
print("blocks:", list(chunks.keys()))
print("generated console import blocks")
