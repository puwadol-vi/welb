#!/usr/bin/env python3
"""
Create a single event via /api/event/create-event.

Usage:
  python scripts/create_event.py <path-to-event.json>
"""

import json
import os
import sys
import urllib.request
from datetime import datetime, timezone
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

# ── Event log ──────────────────────────────────────────────────────────────

LOGS_DIR = Path(__file__).parent.parent / "data" / "logs"
EVENT_LOG = LOGS_DIR / "event-log.json"

def append_event_log(event, event_id):
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log = json.loads(EVENT_LOG.read_text()) if EVENT_LOG.exists() else []

    page_handle = (event.get("pageUrl") or "").rstrip("/").split("/")[-1] or "unknown"

    entry = {
        "scrapeDate": event.get("scrapeDate", "unknown"),
        "page": page_handle,
        "postId": event.get("postId", ""),
        "postUrl": event.get("postUrl", ""),
        "eventId": event_id,
        "title": event["title"],
        "startDate": event["startDate"],
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    if event.get("location"):
        entry["location"] = event["location"]
    if event.get("description"):
        entry["description"] = event["description"]

    log.append(entry)
    EVENT_LOG.write_text(json.dumps(log, ensure_ascii=False, indent=2))
    print("[log] appended to logs/event-log.json", file=sys.stderr)

# ── Main ───────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/create_event.py <path-to-event.json>", file=sys.stderr)
        sys.exit(1)

    load_env()
    event = json.loads(Path(sys.argv[1]).read_text())
    api_base = env("API_BASE_URL").rstrip("/")
    api_key = env("SCRAPER_API_KEY")

    body = {"title": event["title"], "startDate": event["startDate"]}
    for field in ["endDate", "description", "location", "organizerName", "eventUrl", "imageUrl"]:
        if event.get(field):
            body[field] = event[field]
    for field in ["price", "currency"]:
        if event.get(field) is not None:
            body[field] = event[field]
    body["type"] = event.get("type", "meetup")
    body["isMarket"] = event.get("isMarket", False)
    body["isWelBProject"] = event.get("isWelBProject", False)

    payload = json.dumps(body, ensure_ascii=False).encode()
    req = urllib.request.Request(
        f"{api_base}/api/event/create-event",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            print(json.dumps({"status": resp.status, **data}, ensure_ascii=False, indent=2))
            if data.get("success") and data.get("event", {}).get("id"):
                append_event_log(event, data["event"]["id"])
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
