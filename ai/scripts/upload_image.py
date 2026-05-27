#!/usr/bin/env python3
"""
Upload a local image to /api/upload-image and print the permanent public URL.

Usage:
  python scripts/upload_image.py <path-to-image>

Output (JSON):
  {"url": "https://..."}
"""

import json
import mimetypes
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

# ── Multipart helper ────────────────────────────────────────────────────────

def encode_multipart(field, filename, data, content_type, boundary):
    lines = []
    lines.append(f"--{boundary}".encode())
    lines.append(f'Content-Disposition: form-data; name="{field}"; filename="{filename}"'.encode())
    lines.append(f"Content-Type: {content_type}".encode())
    lines.append(b"")
    lines.append(data)
    lines.append(f"--{boundary}--".encode())
    return b"\r\n".join(lines)

# ── Main ───────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/upload_image.py <path-to-image>", file=sys.stderr)
        sys.exit(1)

    load_env()
    image_path = Path(sys.argv[1])
    if not image_path.exists():
        print(json.dumps({"error": f"File not found: {image_path}"}))
        sys.exit(1)

    api_base = env("API_BASE_URL").rstrip("/")
    api_key = env("SCRAPER_API_KEY")

    content_type = mimetypes.guess_type(str(image_path))[0] or "image/jpeg"
    image_data = image_path.read_bytes()
    boundary = "----WelBBoundary7MA4YWxkTrZu0gW"

    body = encode_multipart("image", image_path.name, image_data, content_type, boundary)
    req = urllib.request.Request(
        f"{api_base}/api/upload-image",
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            if data.get("success") and data.get("url"):
                print(json.dumps({"url": data["url"]}))
            else:
                print(json.dumps({"error": "Upload succeeded but no URL returned", "response": data}))
                sys.exit(1)
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            data = json.loads(raw)
            print(json.dumps({"error": data.get("error", e.reason), "status": e.code}))
        except json.JSONDecodeError:
            print(json.dumps({"error": raw or e.reason, "status": e.code}))
        sys.exit(1)

if __name__ == "__main__":
    main()
