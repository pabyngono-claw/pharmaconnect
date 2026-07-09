#!/usr/bin/env python3
"""Generate docs/INDEX.md from first H1 of each markdown file."""
from pathlib import Path

root = Path("/home/deploy/pharmaconnect/docs")
out = root / "INDEX.md"
lines = ["# Docs Index — PharmaConnect v2.0\n\n"]
for p in sorted(root.rglob("*.md")):
    rel = p.relative_to(root)
    if rel.name == "INDEX.md":
        continue
    try:
        text = p.read_text(encoding="utf-8", errors="replace")
    except Exception:
        text = ""
    first = text.splitlines()[0].strip() if text.splitlines() else ""
    if first.startswith("#"):
        first = first.lstrip("# ").strip()
    lines.append(f"- `{rel}`: {first}\n")
out.write_text("".join(lines), encoding="utf-8")
print(out)
print("docs/INDEX.md generated")
