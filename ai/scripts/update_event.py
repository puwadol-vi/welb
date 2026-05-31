#!/usr/bin/env python3
"""
Soft-update an existing event via PATCH /api/event/events/:id.

Creates a new unverified event that copies all fields from the old event,
applying the provided changes. The old event is left untouched.

Usage:
  python scripts/update_event.py <old-event-id> <path-to-patch.json>

patch.json — include only the fields you want to change:
  {
    "imageUrl": "https://...",
    "description": "Updated description..."
  }
"""

import json
import os
import sys
import urllib.request
from pathlib import Path

# ── Env ────────────────────────────────────────────────────────────────────

def load_env():
    env_file = Path(__file__).parent.parent / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, val = line.partition("=")
                os.environ.setdefault(key.strip(), val.strip())

def env(key):
    val = os.environ.get(key)
    if not val:
        raise SystemExit(f"Missing env: {key}")
    return val

# ── Main ───────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 3:
        print("Usage: python scripts/update_event.py <old-event-id> <path-to-patch.json>", file=sys.stderr)
        sys.exit(1)

    load_env()
    old_id = sys.argv[1]
    patch = json.loads(Path(sys.argv[2]).read_text())
    api_base = env("API_BASE_URL").rstrip("/")
    api_key = env("SCRAPER_API_KEY")

    payload = json.dumps(patch, ensure_ascii=False).encode()
    req = urllib.request.Request(
        f"{api_base}/api/event/events/{old_id}",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="PATCH",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            print(json.dumps({"status": resp.status, **data}, ensure_ascii=False, indent=2))
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            data = json.loads(raw)
            print(json.dumps({"status": e.code, **data}, ensure_ascii=False, indent=2))
        except json.JSONDecodeError:
            print(json.dumps({"status": e.code, "error": raw or e.reason}, ensure_ascii=False, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
