#!/usr/bin/env python3
"""
PharmaConnect QA Runner
Executes TC-01..TC-12 against Xano / FlutterFlow and captures evidence.
Usage: python scripts/qa-runner.py --base-url https://api.pharmaconnect.example.com
"""
import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

EVIDENCE_DIR = Path("/home/deploy/pharmaconnect/docs/qa-evidence")
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)

TCASES = {
    "TC-01": "OTP rate limiting",
    "TC-02": "Duplicate auth linking",
    "TC-03": "Request expiry",
    "TC-04": "Reservation race condition",
    "TC-05": "Reservation hold expiry",
    "TC-06": "Illegal status transition",
    "TC-07": "Partial document approval",
    "TC-08": "TVA computation server-side",
    "TC-09": "Payment webhook replay",
    "TC-10": "Account deletion cascade",
    "TC-11": "Waiting-list 24h window",
    "TC-12": "Multi-branch staff scoping",
}


@dataclass
class TCReport:
    id: str
    title: str
    status: str
    steps: str
    before: Optional[str] = None
    after: Optional[str] = None
    notes: str = ""

    def save(self):
        path = EVIDENCE_DIR / f"{self.id}-{self.title.split()[0].lower()}.md"
        path.write_text(
            f"# {self.id} {self.title}\n\nStatus: {self.status}\n\nSteps:\n{self.steps}\n\nNotes: {self.notes}\n",
            encoding="utf-8",
        )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", required=True)
    args = parser.parse_args()

    results = []
    for tid, title in TCASES.items():
        report = TCReport(
            id=tid,
            title=title,
            status="skipped",
            steps="Script skeleton only. Implement HTTP calls against base URL.",
            notes=f"Base URL resolved: {args.base_url}",
        )
        report.save()
        results.append(report)

    summary = {"total": len(results), "passed": 0, "failed": 0, "skipped": len(results)}
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
