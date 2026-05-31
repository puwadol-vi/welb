You are running the WelB Facebook Event Scraper workflow.

Arguments: $ARGUMENTS

---

## Context

WelB is a website listing events and spots in Thailand. You scrape Facebook pages to find event posts, then create unverified events via the API. The user manually reviews and verifies them later.

Working directory: the `ai/` folder of the welb project.
Data: `data/posts/YYYY-MM-DD/` and `data/events/YYYY-MM-DD/` (Bangkok date labels, UTC+7).
Logs: `data/logs/scrape-log.json` and `data/logs/event-log.json`.
Facebook pages to watch: `config/pages.json`.

---

## Step 0: Check local server

Run:
```
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

If the result is NOT `200`, stop immediately and tell the user:
> Local server is not running. Start it first, then re-run /scrape.

---

## Step 1: Parse arguments

Supported arguments:
- `--date YYYY-MM-DD` — start date in Bangkok time (default: yesterday Bangkok)
- `--days N` — number of days (default: 1)
- `--create-only` — skip scraping, use saved detections from `data/events/YYYY-MM-DD/detected.json`

If no `--date`, calculate yesterday in Bangkok time (UTC+7).

---

## Step 2: Scrape (skip if --create-only)

For each date label, run:
```
python3 scripts/scrape.py --date YYYY-MM-DD
```

This saves posts to `data/posts/YYYY-MM-DD/raw.json` and updates `logs/scrape-log.json`.
If the file already exists, scraping is skipped automatically.

---

## Step 3: Read posts

Read `data/posts/YYYY-MM-DD/raw.json`. Each post has:
- `id` — unique post ID
- `text` — post content (usually Thai)
- `timestamp` — ISO UTC string
- `url` — link to the post
- `imageUrls` — array of image URLs
- `localImagePaths` — downloaded images on disk
- `pageUrl` — which Facebook page

---

## Step 4: Load event log for duplicate detection

Read `data/logs/event-log.json` if it exists. This is an array of events already created. Each entry has:
- `postId` — if same postId appears again → definitely skip
- `title` — for fuzzy title matching
- `startDate` — for date matching
- `scrapeDate` — when it was scraped
- `page` — which Facebook page
- `description` — short description of what the event is

Use this log to **skip duplicates** before calling the API:
- Same `postId` → skip (already processed this exact post)
- Same or very similar title **and** same `startDate` within ±1 day → likely same event, skip

---

## Step 5: Check already-created for this date

Read `data/events/YYYY-MM-DD/created.json` if it exists. Skip any `postId` already in that file.

---

## Step 6: Analyze each remaining post

Use **sub-agents in parallel** to analyze multiple posts simultaneously.

For each unprocessed post, decide:

**Is this post announcing an upcoming real-world event that people can attend?**

Signs it IS an event:
- Mentions a specific future date/time
- Has a venue or location
- Invites people to attend
- Announces a concert, workshop, meetup, market, festival, exhibition, sports event, etc.

Signs it is NOT an event:
- General content, promotions, news, updates, lifestyle posts
- Past events or recap/thank-you posts
- Online-only events (live streams, webinars without physical presence)
- Vague "coming soon" with no confirmed date

If it IS an event, extract:
- `title` — clear concise title (keep original language, usually Thai)
- `startDate` — ISO 8601 in Bangkok time (e.g. `2026-05-28T14:00:00`). **Required.**
- `endDate` — if mentioned
- `description` — 2–4 sentence summary in the post's language
- `location` — venue name + address if mentioned
- `price` — number only (e.g. 250), null if free or unknown
- `currency` — "THB" if price in baht, null otherwise
- `organizerName` — organizer or page name
- `eventUrl` — always set to the Facebook **post URL** (`url` field from the post)
- `imageUrl` — first URL from `imageUrls` array (`imageUrls[0]`), or null if none
- `type` — one of: `meetup`, `market`, `concert`, `workshop`, `festival`, `exhibition`, `sports`, `other`
- `isMarket` — true if it's a market/fair/bazaar
- `isWelBProject` — true only if organized by WelB itself (almost always false)

---

## Step 7: Save detections

Write your full analysis to `data/events/YYYY-MM-DD/detected.json`:
```json
[
  {
    "postId": "...",
    "postUrl": "...",
    "isEvent": true,
    "reason": "announces a weekend market with date and location",
    "event": { "title": "...", "startDate": "...", ... }
  },
  {
    "postId": "...",
    "postUrl": "...",
    "isEvent": false,
    "reason": "general promotional post, no specific event date"
  }
]
```

---

## Step 8: Create or soft-update events

For each detection where `isEvent: true` and not skipped by duplicate check:

### 8a: New event (no match in event-log)

1. Write a JSON file to `data/events/YYYY-MM-DD/pending/<postId>.json` with the event fields **plus these extra fields** needed by the log:
   ```json
   {
     "postId": "...",
     "postUrl": "...",
     "pageUrl": "...",
     "scrapeDate": "YYYY-MM-DD",
     "title": "...",
     "startDate": "...",
     "eventUrl": "<facebook post url>",
     "imageUrl": "<imageUrls[0] from post, or null>",
     ...all other event fields...
   }
   ```

2. Run:
   ```
   python3 scripts/create_event.py data/events/YYYY-MM-DD/pending/<postId>.json
   ```

3. Parse the JSON output. The script automatically appends to `data/logs/event-log.json` on success.

### 8b: Soft update (same event, changed data or new image)

If the post matches an existing event in `event-log.json` (same title + startDate) **but** has updated data or a different image, do a soft update instead of skipping:

1. Upload the new image if changed:
   ```
   python3 scripts/upload_image.py <local image path>
   ```

2. Write a patch JSON file to `data/events/YYYY-MM-DD/pending/<postId>.json` with only the changed fields:
   ```json
   { "imageUrl": "...", "description": "..." }
   ```

3. Run:
   ```
   python3 scripts/update_event.py <old_eventId> data/events/YYYY-MM-DD/pending/<postId>.json
   ```

4. The script calls `PATCH /api/event/events/<old_eventId>` and prints the response. The API returns `{ "action": "soft-updated", "oldId": "...", "event": { "id": "<new_id>", "ref_id": "<old_id>", ... } }`.

4. Record in `created.json` with `"action": "soft-updated"`.

After all posts, write results to `data/events/YYYY-MM-DD/created.json`:
```json
[
  { "postId": "...", "postUrl": "...", "success": true, "eventId": "...", "action": "created" },
  { "postId": "...", "postUrl": "...", "success": true, "eventId": "<new_id>", "oldEventId": "<old_id>", "action": "soft-updated" },
  { "postId": "...", "postUrl": "...", "success": false, "error": "..." },
  { "postId": "...", "postUrl": "...", "skipped": true, "skipReason": "duplicate: same title+date, no changes detected" }
]
```

---

## Step 9: Report

Print a summary:
- **Scrape log** — which pages were scraped on which dates (from `data/logs/scrape-log.json`)
- **Posts** — how many fetched, how many analyzed
- **Events found** — count, with titles and start dates
- **Skipped** — count and reasons (duplicate, already processed)
- **Created** — count, with event IDs and post URLs
- **Failed** — count with errors
