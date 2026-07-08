#!/usr/bin/env python3
"""
Local QA runner wrapper for PharmaConnect.
Reads secrets from local .env or environment and executes qa-runner.py.
"""
import os
import subprocess
import sys
from pathlib import Path

PHARMA_DIR = Path("/home/deploy/pharmaconnect")
ENV_FILE = PHARMA_DIR / ".env"
QA_RUNNER = PHARMA_DIR / "scripts" / "qa-runner.py"
DEFAULT_BASE = "https://x8ki-letl-twmt.n7.xano.io/api:1uUbbKJp"


def load_env():
    env = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip("\"'")
    return env


def main():
    env = load_env()
    base_url = os.environ.get("XANO_API_URL", env.get("XANO_API_URL", DEFAULT_BASE))
    token = os.environ.get("XANO_API_TOKEN", env.get("XANO_API_TOKEN", ""))

    if not token:
        print("ERROR: XANO_API_TOKEN is required. Set it in .env or environment.")
        sys.exit(2)

    cmd = [
        sys.executable,
        str(QA_RUNNER),
        "--base-url",
        base_url,
        "--token",
        token,
    ]
    print(f"+ {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=str(PHARMA_DIR), capture_output=False)
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
