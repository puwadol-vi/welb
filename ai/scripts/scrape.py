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
import re
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
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
BATCH_SIZE = 20  # results per page per Apify run

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

_FB_PHOTO_RE = re.compile(r"facebook\.com/photo/?\?")

def _resolve_fb_photo_url(url: str) -> str:
    """Fetch the mobile Facebook /photo/?fbid= page and extract the real CDN image URL.
    Returns the original url unchanged on any failure."""
    try:
        # Use mobile URL — it returns simpler HTML with direct CDN image src attributes
        mobile_url = url.replace("://www.facebook.com/", "://m.facebook.com/") \
                        .replace("://web.facebook.com/", "://m.facebook.com/")
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) "
                "AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
            ),
            "Accept-Language": "en-US,en;q=0.9",
        }
        req = urllib.request.Request(mobile_url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")

        # Find actual photo CDN URLs (not UI resources like rsrc.php).
        # Facebook photo CDN paths contain /v/t39. or /v/t1. etc.
        # Capture the full URL including query string (auth tokens), replacing HTML entities.
        m = re.search(
            r'https://[^\s"<>]+(?:fbcdn|scontent)[^\s"<>]+/v/[^\s"<>]+\.(?:jpg|jpeg|png|webp)[^\s"<>]*',
            html,
        )
        if m:
            return m.group(0).replace("&amp;", "&")

    except Exception:
        pass
    return url

def _resolve_image_url(url: str) -> str:
    """If url points to a Facebook photo page (not a direct CDN file), resolve it to the CDN URL."""
    if _FB_PHOTO_RE.search(url):
        return _resolve_fb_photo_url(url)
    return url

_IMAGE_MAGIC = (b"\xff\xd8\xff", b"\x89PNG", b"RIFF", b"GIF8", b"WEBP")

def download_image(url: str, dest: Path) -> tuple:
    """Download image, resolving Facebook photo pages to real CDN URLs first.
    Returns (success: bool, resolved_url: str) so callers can use the resolved URL."""
    resolved = _resolve_image_url(url)
    if dest.exists():
        return True, resolved
    try:
        req = urllib.request.Request(resolved, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
        # Reject HTML responses (happens when CDN URL has expired or is inaccessible)
        if not any(data.startswith(sig) for sig in _IMAGE_MAGIC):
            return False, resolved
        dest.write_bytes(data)
        return True, resolved
    except Exception:
        return False, resolved

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

_api_keys: list[str] = []
_key_idx: int = 0

def load_api_keys():
    """Load APIFY_API_KEY_1, _2, _3, ... from env. Must call after load_env()."""
    global _api_keys, _key_idx
    keys = []
    for i in range(1, 5):
        val = os.environ.get(f"APIFY_API_KEY_{i}")
        if val:
            keys.append(val)
        else:
            break
    if not keys:
        raise SystemExit("No APIFY_API_KEY_1 / _2 / _3 found in environment")
    _api_keys = keys
    _key_idx = 0
    print(f"  loaded {len(keys)} Apify API key(s)")

def _rotate_key():
    """Switch to the next API key. Raises if all keys are exhausted."""
    global _key_idx
    _key_idx += 1
    if _key_idx >= len(_api_keys):
        raise SystemExit(f"All {len(_api_keys)} Apify API key(s) exhausted (402/403 on all)")
    print(f"  switching to Apify key {_key_idx + 1}/{len(_api_keys)}...")

def apify_request(path: str, method="GET", body=None):
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"} if data else {}
    while True:
        url = f"{APIFY_BASE}{path}?token={_api_keys[_key_idx]}"
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            if e.code in (402, 403):
                _rotate_key()
                continue
            raise

def start_run(page_urls: list, from_date: datetime, results_limit: int = BATCH_SIZE) -> str:
    payload = {
        "startUrls": [{"url": u} for u in page_urls],
        "resultsLimit": results_limit,
        "onlyPostsNewerThan": from_date.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "onlyPostsOlderThan": (from_date + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
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
    url = f"{APIFY_BASE}/datasets/{dataset_id}/items?token={_api_keys[_key_idx]}&format=json&clean=true"
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

# ── Page URL matching ──────────────────────────────────────────────────────

def _page_key(url: str) -> str:
    """Normalize a Facebook URL to a comparable page identifier.
    Handles: /handle/posts/xxx, /profile.php?id=xxx, /permalink.php?...&id=xxx
    """
    try:
        p = urllib.parse.urlparse(url)
        qs = urllib.parse.parse_qs(p.query)
        # profile.php?id=xxx  or  permalink.php?story_fbid=xxx&id=xxx
        if "id" in qs:
            return qs["id"][0]
        # /handle  or  /handle/posts/xxx  or  /handle/
        parts = [x for x in p.path.split("/") if x and x not in ("posts", "photos", "videos")]
        if parts:
            return parts[0].lower()
    except Exception:
        pass
    return url

def _match_page(post_url: str, page_urls: list) -> str | None:
    """Return the input page URL that owns the post, or None if unmatched."""
    key = _page_key(post_url)
    for page_url in page_urls:
        if _page_key(page_url) == key:
            return page_url
    return None

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

    def parse_ts(ts_str: str) -> datetime:
        dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)

    all_posts: dict[str, dict] = {}    # postId → post (global dedup store)
    active_pages = list(pages)
    results_limit = BATCH_SIZE
    run_num = 0
    total_fetched = 0

    while active_pages:
        run_num += 1
        print(f"  run {run_num}: {len(active_pages)} page(s), resultsLimit={results_limit}...")

        try:
            run_id = start_run(active_pages, from_utc, results_limit)
        except Exception:
            update_scrape_log(label, pages, False)
            raise

        try:
            dataset_id = wait_for_run(run_id)
        except Exception:
            update_scrape_log(label, pages, False)
            raise

        raw_posts = fetch_dataset(dataset_id)
        total_fetched += len(raw_posts)
        print(f"  fetched {len(raw_posts)} items")

        # Normalize, match to input page, deduplicate
        per_page_count: dict[str, int] = {p: 0 for p in active_pages}
        for raw in raw_posts:
            post = normalize_post(raw, active_pages[0])
            matched = _match_page(post["url"], active_pages)
            if matched:
                post["pageUrl"] = matched
                per_page_count[matched] += 1
                if post["id"] not in all_posts:
                    all_posts[post["id"]] = post

        # Pages that returned a full batch may have more posts in the window
        # → re-run with a higher limit (cumulative: +BATCH_SIZE each round)
        next_active = [
            page for page in active_pages
            if per_page_count.get(page, 0) >= results_limit
        ]
        if next_active:
            results_limit += BATCH_SIZE
        active_pages = next_active

    print(f"  total fetched across {run_num} run(s): {total_fetched} items")

    # Collect only posts inside the target date window
    posts = [
        post for post in all_posts.values()
        if from_utc <= parse_ts(post["timestamp"]) < to_utc
    ]
    print(f"  {len(posts)} posts within date window")

    # Download images
    img_dir = posts_dir(label) / "images"
    img_dir.mkdir(parents=True, exist_ok=True)
    downloaded = 0
    for post in posts:
        for i, url in enumerate(post["imageUrls"]):
            # Resolve first so extension comes from the real CDN URL
            resolved = _resolve_image_url(url)
            ext = resolved.split("?")[0].split(".")[-1][:4] or "jpg"
            if ext.lower() not in ("jpg", "jpeg", "png", "webp", "gif"):
                ext = "jpg"
            dest = img_dir / f"{post['id']}_{i}.{ext}"
            ok, _ = download_image(url, dest)
            if ok:
                post["localImagePaths"].append(str(dest))
                downloaded += 1

    save_posts(label, posts)
    update_scrape_log(label, pages, True)
    print(f"  saved → data/posts/{label}/raw.json")
    print(f"  images → data/posts/{label}/images/ ({downloaded} downloaded)")

def main():
    load_env()
    load_api_keys()
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
