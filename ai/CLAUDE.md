# WelB Event Scraper

AI-powered Facebook scraper that finds event posts and creates unverified events on the WelB platform.

## Setup

```bash
cp .env.example .env   # fill in your keys
```

No install needed — scripts use Python 3 stdlib only.

## How to use

Open Claude Code in this directory, then use the `/scrape` command:

```
/scrape                              # yesterday's posts (default)
/scrape --date 2026-05-20            # specific date
/scrape --date 2026-05-20 --days 3   # 3 days starting from that date
/scrape --date 2026-05-20 --create-only  # skip re-scraping, use saved detections
```

## API documentation

All API docs live in `docs/`. Always read the relevant doc before calling an API:
- `docs/event/CREATE-EVENT.md` — create event
- `docs/utilities/UPLOAD-IMAGE.md` — upload image, get permanent URL
- Other endpoints under `docs/event/` and `docs/spot/`

## What Claude does

1. Runs `python3 scripts/scrape.py` → fetches posts from Apify, saves to `data/posts/`
2. Reads each post and decides if it's an event (using Claude's own reasoning)
3. Checks `data/logs/event-log.json` for duplicates before creating
4. For each event: uploads the local image via `python3 scripts/upload_image.py` → gets permanent `imageUrl`
5. Sets `eventUrl` = the Facebook post URL
6. Runs `python3 scripts/create_event.py` → calls `/api/create-event` with `imageUrl` and `eventUrl`
7. Saves all results to `data/events/` and updates logs

## Data layout

```
data/
  posts/
    2026-05-20/
      raw.json        ← raw Facebook posts from Apify
      images/         ← downloaded post images
  events/
    2026-05-20/
      detected.json   ← Claude's analysis (isEvent + extracted fields)
      pending/        ← temp JSON files passed to create_event.py
      created.json    ← API call results

  logs/
    scrape-log.json   ← which pages scraped on which dates (true/false table)
    event-log.json    ← all created events (used for duplicate detection)
```

## Standalone scripts

```bash
# Just scrape (no event creation)
python3 scripts/scrape.py --date 2026-05-20

# Upload an image and get a permanent URL
python3 scripts/upload_image.py data/posts/2026-05-20/images/<file.jpg>

# Create a single event from a JSON file
python3 scripts/create_event.py data/events/2026-05-20/pending/<postId>.json
```

## Environment variables

See `.env.example`.

## Adding more Facebook pages

Edit `config/pages.json`.
