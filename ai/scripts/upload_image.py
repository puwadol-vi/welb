#!/usr/bin/env python3
"""
Upload a local image to /api/upload-image and print the permanent public URL.

Usage:
  python scripts/upload_image.py <path-to-image>

Output (JSON):
  {"url": "https://..."}
"""

import io
import json
import mimetypes
import os
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

MAX_UPLOAD_BYTES = 100_000  # 100 KB

_IMAGE_MAGIC = (
    b"\xff\xd8\xff",       # JPEG
    b"\x89PNG",            # PNG
    b"RIFF",               # WebP (RIFF....WEBP)
    b"GIF",                # GIF
    b"\x00\x00\x01\x00",  # ICO
)

def _is_image(data: bytes) -> bool:
    return any(data.startswith(sig) for sig in _IMAGE_MAGIC)

def shrink_image(path: Path) -> tuple:
    """Return (bytes, content_type), resizing to < 100 KB if needed.
    Raises SystemExit if the file is not a recognised image format."""
    data = path.read_bytes()

    if not _is_image(data):
        raise SystemExit(f"Not a recognised image file: {path.name} (got HTML or unknown format)")

    if len(data) <= MAX_UPLOAD_BYTES:
        ct = mimetypes.guess_type(str(path))[0] or "image/jpeg"
        return data, ct

    print(f"  image is {len(data) // 1024} KB, resizing to < 100 KB...", file=sys.stderr)

    # Try Pillow first
    try:
        from PIL import Image  # type: ignore

        img = Image.open(io.BytesIO(data)).convert("RGB")
        w, h = img.size
        for scale in (1.0, 0.75, 0.5, 0.35, 0.25):
            sized = img.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS) if scale < 1.0 else img
            for quality in (85, 60, 40, 20):
                buf = io.BytesIO()
                sized.save(buf, format="JPEG", quality=quality, optimize=True)
                result = buf.getvalue()
                if len(result) <= MAX_UPLOAD_BYTES:
                    print(f"  → {len(result) // 1024} KB (scale={scale}, quality={quality})", file=sys.stderr)
                    return result, "image/jpeg"
    except Exception:
        pass  # PIL not installed or can't open — fall through to sips

    # Fallback: sips (macOS built-in)
    abs_path = path.resolve()
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        for width in (1200, 800, 600, 400, 250):
            subprocess.run(
                ["sips", "-s", "format", "jpeg", str(abs_path), "--resampleWidth", str(width), "--out", str(tmp_path)],
                check=True, capture_output=True,
            )
            result = tmp_path.read_bytes()
            if len(result) <= MAX_UPLOAD_BYTES:
                print(f"  → {len(result) // 1024} KB (sips width={width})", file=sys.stderr)
                return result, "image/jpeg"
    finally:
        tmp_path.unlink(missing_ok=True)

    raise SystemExit("Cannot shrink image below 100 KB")

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

    image_data, content_type = shrink_image(image_path)
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
