#!/usr/bin/env python3
"""
Scrape Facebook posts using Apify and save to disk.

Usage:
  python3 scripts/scrape.py                        # yesterday (Bangkok time)
  python3 scripts/scrape.py --date 2026-05-20      # specific date
  python3 scripts/scrape.py --date 2026-05-20 --days 3

Output:
  data/posts/YYYY-MM-DD/raw.json
  data/posts/YYYY-MM-DD/images/
  logs/scrape-log.json  (updated)

Actor: apify/facebook-posts-scraper
https://apify.com/apify/facebook-posts-scraper
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta
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

# ── Constants ──────────────────────────────────────────────────────────────

APIFY_BASE = "https://api.apify.com/v2"
ACTOR_ID = "apify~facebook-posts-scraper"
BANGKOK_OFFSET = timedelta(hours=7)

# ── Date helpers ───────────────────────────────────────────────────────────

def bangkok_midnight_utc(label: str) -> datetime:
    """Return midnight Bangkok time for YYYY-MM-DD label, as UTC datetime."""
    y, m, d = map(int, label.split("-"))
    midnight_bkk = datetime(y, m, d, 0, 0, 0, tzinfo=timezone.utc)
    return midnight_bkk - BANGKOK_OFFSET  # convert to UTC

def yesterday_bangkok() -> str:
    bkk_now = datetime.now(timezone.utc) + BANGKOK_OFFSET
    yesterday = bkk_now - timedelta(days=1)
    return yesterday.strftime("%Y-%m-%d")

def add_days(label: str, n: int) -> str:
    y, m, d = map(int, label.split("-"))
    dt = datetime(y, m, d) + timedelta(days=n)
    return dt.strftime("%Y-%m-%d")

# ── Storage ────────────────────────────────────────────────────────────────

def posts_dir(label: str) -> Path:
    return Path("data") / "posts" / label

def save_posts(label: str, posts: list):
    d = posts_dir(label)
    d.mkdir(parents=True, exist_ok=True)
    (d / "raw.json").write_text(json.dumps(posts, ensure_ascii=False, indent=2))

def download_image(url: str, dest: Path) -> bool:
    if dest.exists():
        return True
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            dest.write_bytes(resp.read())
        return True
    except Exception:
        return False

# ── Scrape log ─────────────────────────────────────────────────────────────

LOGS_DIR = Path("data") / "logs"
SCRAPE_LOG = LOGS_DIR / "scrape-log.json"

def page_handle(url: str) -> str:
    return url.rstrip("/").split("/")[-1] or url

def update_scrape_log(label: str, pages: list, success: bool):
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log = json.loads(SCRAPE_LOG.read_text()) if SCRAPE_LOG.exists() else {}
    if label not in log:
        log[label] = {}
    for page in pages:
        handle = page_handle(page)
        if success or log[label].get(handle) is not True:
            log[label][handle] = success
    sorted_log = dict(sorted(log.items()))
    SCRAPE_LOG.write_text(json.dumps(sorted_log, ensure_ascii=False, indent=2))

# ── Apify API ──────────────────────────────────────────────────────────────

def apify_request(path: str, method="GET", body=None):
    api_key = env("APIFY_API_KEY")
    url = f"{APIFY_BASE}{path}?token={api_key}"
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())

def start_run(page_urls: list, from_date: datetime) -> str:
    payload = {
        "startUrls": [{"url": u} for u in page_urls],
        "resultsLimit": 50,
        "onlyPostsNewerThan": from_date.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
    }
    result = apify_request(f"/acts/{ACTOR_ID}/runs", method="POST", body=payload)
    return result["data"]["id"]

def wait_for_run(run_id: str, timeout_sec=600) -> str:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        time.sleep(5)
        result = apify_request(f"/actor-runs/{run_id}")
        status = result["data"]["status"]
        dataset_id = result["data"]["defaultDatasetId"]
        print(f"  apify run: {status}")
        if status == "SUCCEEDED":
            return dataset_id
        if status in ("FAILED", "ABORTED", "TIMED-OUT"):
            raise RuntimeError(f"Run ended with status: {status}")
    raise RuntimeError("Apify run timed out")

def fetch_dataset(dataset_id: str) -> list:
    result = apify_request(f"/datasets/{dataset_id}/items", )
    # dataset items endpoint returns a list directly
    url = f"{APIFY_BASE}/datasets/{dataset_id}/items?token={env('APIFY_API_KEY')}&format=json&clean=true"
    with urllib.request.urlopen(url, timeout=30) as resp:
        return json.loads(resp.read())

def normalize_post(raw: dict, default_page_url: str) -> dict:
    image_urls = []
    for m in raw.get("media") or []:
        u = m.get("url") or m.get("thumbnail")
        if u and u not in image_urls:
            image_urls.append(u)
    for img in raw.get("images") or []:
        if img.get("url") and img["url"] not in image_urls:
            image_urls.append(img["url"])

    return {
        "id": str(raw.get("postId") or raw.get("id") or str(time.time())),
        "text": str(raw.get("text") or raw.get("message") or ""),
        "timestamp": str(raw.get("time") or raw.get("timestamp") or datetime.now(timezone.utc).isoformat()),
        "url": str(raw.get("url") or raw.get("link") or ""),
        "imageUrls": image_urls,
        "localImagePaths": [],
        "pageUrl": str(raw.get("pageUrl") or default_page_url),
    }

# ── Main scrape ────────────────────────────────────────────────────────────

def scrape_date(label: str, pages: list):
    from_utc = bangkok_midnight_utc(label)
    to_utc = from_utc + timedelta(days=1)

    print(f"\n── {label} ({from_utc.isoformat()} → {to_utc.isoformat()})")

    raw_file = posts_dir(label) / "raw.json"
    if raw_file.exists():
        print(f"  already scraped, skipping (delete {raw_file} to re-scrape)")
        update_scrape_log(label, pages, True)
        return

    print(f"  starting Apify run for {len(pages)} page(s)...")
    try:
        run_id = start_run(pages, from_utc)
    except Exception as e:
        update_scrape_log(label, pages, False)
        raise

    try:
        dataset_id = wait_for_run(run_id)
    except Exception as e:
        update_scrape_log(label, pages, False)
        raise

    raw_posts = fetch_dataset(dataset_id)
    print(f"  fetched {len(raw_posts)} items from Apify")

    posts = []
    for raw in raw_posts:
        post = normalize_post(raw, pages[0])
        ts = datetime.fromisoformat(post["timestamp"].replace("Z", "+00:00"))
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        if from_utc <= ts < to_utc:
            posts.append(post)

    print(f"  {len(posts)} posts within date window")

    # Download images
    img_dir = posts_dir(label) / "images"
    img_dir.mkdir(parents=True, exist_ok=True)
    downloaded = 0
    for post in posts:
        for i, url in enumerate(post["imageUrls"]):
            ext = url.split("?")[0].split(".")[-1][:4] or "jpg"
            dest = img_dir / f"{post['id']}_{i}.{ext}"
            if download_image(url, dest):
                post["localImagePaths"].append(str(dest))
                downloaded += 1

    save_posts(label, posts)
    update_scrape_log(label, pages, True)
    print(f"  saved → data/posts/{label}/raw.json")
    print(f"  images → data/posts/{label}/images/ ({downloaded} downloaded)")

def main():
    load_env()
    args = sys.argv[1:]
    date = None
    days = 1
    pages = []

    i = 0
    while i < len(args):
        if args[i] == "--date" and i + 1 < len(args):
            date = args[i + 1]; i += 2
        elif args[i] == "--days" and i + 1 < len(args):
            days = int(args[i + 1]); i += 2
        elif args[i] == "--page" and i + 1 < len(args):
            pages.append(args[i + 1]); i += 2
        else:
            i += 1

    if not pages:
        cfg = json.loads((Path(__file__).parent.parent / "config" / "pages.json").read_text())
        pages = [url for url in cfg.get("facebook", {}).values() if url]

    start_label = date or yesterday_bangkok()
    labels = [add_days(start_label, i) for i in range(days)]

    print("WelB Facebook Scraper")
    print(f"pages: {', '.join(pages)}")
    print(f"dates: {', '.join(labels)}")

    for label in labels:
        scrape_date(label, pages)

    print("\ndone.")

if __name__ == "__main__":
    main()
