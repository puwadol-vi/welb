# Apify YouTube Scrapers — Reference Guide

> **Context:** YouTube Data API v3 gives only 10,000 quota units/day — a single `search.list` call costs 100 units, exhausting the budget in 100 requests. Apify actors scrape public YouTube surfaces (web + innertube) instead, billing per result with no daily quota ceiling. No Google API key required.

> All actors share the same base API pattern:
>
> ```
> POST https://api.apify.com/v2/acts/{actor-id}/runs?token=YOUR_TOKEN
> ```
>
> Synchronous (run + return results in one call):
>
> ```
> POST https://api.apify.com/v2/acts/{actor-id}/run-sync-get-dataset-items?token=YOUR_TOKEN
> ```
>
> Output formats available for all actors: **JSON, CSV, Excel (XLSX), HTML**

---

## Actor Comparison

| Actor                      | Actor ID                                   | Price                  | Rating | Users | Best for                                                     |
| -------------------------- | ------------------------------------------ | ---------------------- | ------ | ----- | ------------------------------------------------------------ |
| YouTube Scraper            | `streamers/youtube-scraper`                | $2.40 / 1k videos      | 4.73★  | 69k   | Default — search, channels, playlists, watch URLs, subtitles |
| YouTube Comments Scraper   | `streamers/youtube-comments-scraper`       | $0.90 / 1k comments    | 4.49★  | 14k   | Sentiment, QA mining, creator feedback                       |
| YouTube Channel Scraper    | `streamers/youtube-channel-scraper`        | $0.50 / 1k results     | 4.36★  | 12k   | Channel metadata, subscriber tracking, uploads feed          |
| YouTube Shorts Scraper     | `streamers/youtube-shorts-scraper`         | $2.40 / 1k shorts      | 4.74★  | 44k   | Vertical-format analytics, Shorts-native fields              |
| YouTube Transcript Scraper | `codepoetry/youtube-transcript-ai-scraper` | $0.70 / 1k transcripts | —      | 64    | Captions + Whisper AI fallback, RAG-ready output             |
| YouTube Video Downloader   | `epctex/youtube-video-downloader`          | $30/mo + usage         | 4.09★  | 3k    | MP4 retrieval (own/licensed content only)                    |

_Prices and ratings verified on Apify Store 2026-04-17. All Streamers actors use pay-per-event pricing._

---

## 1. YouTube Scraper (Default Pick)

**Actor ID:** `streamers/youtube-scraper`
**API path:** `https://api.apify.com/v2/acts/streamers~youtube-scraper/runs`

### Input

| Field                | Type    | Description                                               |
| -------------------- | ------- | --------------------------------------------------------- |
| `startUrls`          | array   | YouTube video, channel, playlist, or search results URLs  |
| `searchKeywords`     | string  | Keyword search query (alternative to `startUrls`)         |
| `maxResults`         | integer | Max videos per search/channel — leave empty for unlimited |
| `maxResultsShorts`   | integer | Max Shorts to extract (set `0` to skip Shorts)            |
| `maxResultsStreams`  | integer | Max live streams to extract (set `0` to skip streams)     |
| `saveSubtitles`      | boolean | Extract subtitle/caption text for each video              |
| `subtitleLanguage`   | string  | Language code for subtitles (e.g. `en`, `th`)             |
| `uploadDateFilter`   | string  | `hour`, `today`, `week`, `month`, `year`                  |
| `sortBy`             | string  | `relevance`, `date`, `viewCount`, `rating`                |
| `videoDuration`      | string  | `short` (<4 min), `medium` (4–20 min), `long` (>20 min)   |
| `videoType`          | string  | `video`, `channel`, `playlist`, `movie`, `live`           |
| `videoFeatures`      | array   | `hd`, `subtitles`, `4k`, `360`, `vr180`, `3d`, `hdr`      |
| `proxyConfiguration` | object  | Proxy settings                                            |

```json
{
  "startUrls": [
    { "url": "https://www.youtube.com/c/NASA/videos" },
    { "url": "https://www.youtube.com/results?search_query=space+documentary" }
  ],
  "maxResults": 100,
  "maxResultsShorts": 0,
  "saveSubtitles": false,
  "sortBy": "date"
}
```

### Output

| Field                | Type    | Description                                        |
| -------------------- | ------- | -------------------------------------------------- |
| `id`                 | string  | YouTube video ID                                   |
| `title`              | string  | Video title                                        |
| `url`                | string  | Full watch URL                                     |
| `description`        | string  | Full video description                             |
| `descriptionLinks`   | array   | URLs extracted from description                    |
| `hashtags`           | array   | Hashtags in title/description                      |
| `viewCount`          | integer | Total view count                                   |
| `likes`              | integer | Like count                                         |
| `commentsCount`      | integer | Total comment count                                |
| `duration`           | string  | Video duration (HH:MM:SS)                          |
| `uploadDate`         | string  | ISO 8601 upload date                               |
| `isShort`            | boolean | Whether the video is a YouTube Short               |
| `isStream`           | boolean | Whether the video is a live stream                 |
| `thumbnailUrl`       | string  | Thumbnail image URL                                |
| `channelId`          | string  | Channel ID                                         |
| `channelName`        | string  | Channel display name                               |
| `channelUrl`         | string  | Channel URL                                        |
| `channelDescription` | string  | Channel bio                                        |
| `channelJoinDate`    | string  | Channel creation date                              |
| `subscriberCount`    | integer | Channel subscriber count                           |
| `channelTotalVideos` | integer | Total videos on channel                            |
| `channelTotalViews`  | integer | Cumulative channel views                           |
| `subtitles`          | string  | Caption/subtitle text (when `saveSubtitles: true`) |

**Description:** The flagship YouTube actor by Streamers. Accepts search queries, channel URLs, playlist IDs, and direct watch URLs in one run. Bypasses the YouTube Data API's 10,000 quota-unit/day ceiling. Detects and handles Shorts automatically. 98.9% success rate across ~70k users. Pricing: ~$2.40 / 1,000 videos.

---

## 2. YouTube Comments Scraper

**Actor ID:** `streamers/youtube-comments-scraper`
**API path:** `https://api.apify.com/v2/acts/streamers~youtube-comments-scraper/runs`

### Input

| Field                  | Type    | Description                                                                  |
| ---------------------- | ------- | ---------------------------------------------------------------------------- |
| `videoUrls`            | array   | YouTube video or Shorts URLs to scrape comments from                         |
| `maxCommentsPerVideo`  | integer | Max comments per video (`0` for unlimited, default: 100)                     |
| `sortBy`               | string  | `top` (most liked), `new` (newest first)                                     |
| `includeReplies`       | boolean | Expand reply threads (default: `false` — each reply counts as a billed item) |
| `maxRepliesPerComment` | integer | Max replies to fetch per top-level comment                                   |
| `proxyConfiguration`   | object  | Proxy settings                                                               |

```json
{
  "videoUrls": [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/ABC123"
  ],
  "maxCommentsPerVideo": 500,
  "sortBy": "top",
  "includeReplies": false
}
```

### Output

| Field               | Type    | Description                                |
| ------------------- | ------- | ------------------------------------------ |
| `commentId`         | string  | Unique comment ID                          |
| `text`              | string  | Full comment text (plain text)             |
| `contentHtml`       | string  | Comment text with embedded HTML links      |
| `author`            | string  | Commenter display name                     |
| `authorChannelId`   | string  | Commenter's channel ID                     |
| `authorChannelUrl`  | string  | Commenter's channel URL                    |
| `authorAvatarUrl`   | string  | Commenter's profile picture URL            |
| `authorIsArtist`    | boolean | Whether commenter has YouTube artist badge |
| `likeCount`         | integer | Likes on the comment                       |
| `replyCount`        | integer | Number of replies                          |
| `publishedTimeText` | string  | Human-readable time (e.g. `2 days ago`)    |
| `updatedAt`         | string  | ISO 8601 last-edited timestamp             |
| `isEdited`          | boolean | Whether the comment was edited             |
| `isHearted`         | boolean | Whether the creator hearted the comment    |
| `isPinned`          | boolean | Whether the comment is pinned              |
| `isReply`           | boolean | Whether this item is a reply               |
| `parentCommentId`   | string  | ID of parent comment (replies only)        |
| `replyDepth`        | integer | `0` = top-level, `1` = reply               |
| `videoId`           | string  | Source video ID                            |
| `videoTitle`        | string  | Source video title                         |
| `videoUrl`          | string  | Source video URL                           |
| `videoCommentCount` | integer | Total comment count on the video           |
| `scrapeTimestamp`   | string  | ISO 8601 scrape time                       |

**Description:** Dedicated comment extraction actor. Paginates via YouTube's innertube API so it goes beyond the first visible page. Note: held-for-review, spam-flagged, and some geo-blocked comments (~5–15%) won't surface. For sentiment analysis, 200–500 top comments per video typically captures the main themes. Pricing: ~$0.90 / 1,000 comments.

---

## 3. YouTube Channel Scraper

**Actor ID:** `streamers/youtube-channel-scraper`
**API path:** `https://api.apify.com/v2/acts/streamers~youtube-channel-scraper/runs`

### Input

| Field                  | Type    | Description                                                    |
| ---------------------- | ------- | -------------------------------------------------------------- |
| `startUrls`            | array   | Channel URLs or handles (e.g. `https://www.youtube.com/@NASA`) |
| `maxVideos`            | integer | Max videos to extract per channel                              |
| `maxShorts`            | integer | Max Shorts to extract per channel (`0` to skip)                |
| `maxStreams`           | integer | Max live streams to extract per channel (`0` to skip)          |
| `maxComments`          | integer | Max comments per video (optional, `0` to skip)                 |
| `sortVideosBy`         | string  | `date`, `rating`, `relevance`, `title`, `viewCount`            |
| `sortShortsBy`         | string  | `date`, `rating`, `relevance`, `viewCount`                     |
| `scrapeAbout`          | boolean | Include channel About page metadata                            |
| `scrapeVideos`         | boolean | Include channel video feed                                     |
| `scrapeShorts`         | boolean | Include Shorts feed                                            |
| `scrapeCommunityPosts` | boolean | Include community post feed                                    |
| `scrapeStreams`        | boolean | Include live streams feed                                      |
| `proxyConfiguration`   | object  | Proxy settings                                                 |

```json
{
  "startUrls": [
    { "url": "https://www.youtube.com/@NASA" },
    { "url": "https://www.youtube.com/@mkbhd" }
  ],
  "maxVideos": 50,
  "maxShorts": 0,
  "scrapeAbout": true,
  "scrapeVideos": true
}
```

### Output — Channel record

| Field                | Type    | Description                    |
| -------------------- | ------- | ------------------------------ |
| `channelId`          | string  | Channel ID                     |
| `channelName`        | string  | Channel display name           |
| `channelHandle`      | string  | @handle                        |
| `channelUrl`         | string  | Channel URL                    |
| `channelDescription` | string  | About page bio                 |
| `subscriberCount`    | integer | Subscriber count               |
| `totalViews`         | integer | Cumulative view count          |
| `totalVideos`        | integer | Total uploaded video count     |
| `joinedDate`         | string  | ISO 8601 channel creation date |
| `country`            | string  | Channel country                |
| `links`              | array   | External links from About page |
| `avatarUrl`          | string  | Channel profile picture URL    |
| `bannerUrl`          | string  | Channel banner image URL       |

### Output — Video record (per upload)

| Field          | Type    | Description                        |
| -------------- | ------- | ---------------------------------- |
| `videoId`      | string  | Video ID                           |
| `title`        | string  | Video title                        |
| `url`          | string  | Watch URL                          |
| `viewCount`    | integer | View count                         |
| `likes`        | integer | Like count                         |
| `duration`     | string  | Duration (HH:MM:SS)                |
| `uploadDate`   | string  | ISO 8601 upload date               |
| `thumbnailUrl` | string  | Thumbnail URL                      |
| `isMonetized`  | boolean | Whether the video has ads detected |

**Description:** Channel-grain workflows: competitor tracking, subscriber delta monitoring, uploads feed crawling, and About-page metadata collection. The cheapest actor in the set at $0.50/1k results. 99.7% success rate. Schedule daily on competitor channels without per-video overhead. Pricing: ~$0.50 / 1,000 results.

---

## 4. YouTube Shorts Scraper

**Actor ID:** `streamers/youtube-shorts-scraper`
**API path:** `https://api.apify.com/v2/acts/streamers~youtube-shorts-scraper/runs`

### Input

| Field                | Type    | Description                        |
| -------------------- | ------- | ---------------------------------- |
| `startUrls`          | array   | Channel URLs or direct Shorts URLs |
| `maxResults`         | integer | Max Shorts to extract per channel  |
| `proxyConfiguration` | object  | Proxy settings                     |

```json
{
  "startUrls": [{ "url": "https://www.youtube.com/@MrBeast/shorts" }],
  "maxResults": 100
}
```

### Output

| Field             | Type    | Description                    |
| ----------------- | ------- | ------------------------------ |
| `videoId`         | string  | Shorts video ID                |
| `url`             | string  | Direct Shorts URL              |
| `caption`         | string  | Shorts title/caption           |
| `duration`        | integer | Duration in seconds            |
| `viewCount`       | integer | Total view count               |
| `likes`           | integer | Like count                     |
| `dislikes`        | integer | Dislike count (when available) |
| `commentsCount`   | integer | Comment count                  |
| `uploadDate`      | string  | ISO 8601 upload date           |
| `isShort`         | boolean | Always `true`                  |
| `hasSubtitles`    | boolean | Whether captions are available |
| `hasComments`     | boolean | Whether comments are enabled   |
| `thumbnailUrl`    | string  | Thumbnail URL                  |
| `channelName`     | string  | Creator channel name           |
| `channelUrl`      | string  | Creator channel URL            |
| `subscriberCount` | integer | Creator subscriber count       |

**Description:** Reads the YouTube Shorts feed natively instead of forcing vertical clips through the long-form schema. Returns correct `isShort`, vertical `duration`, and Shorts-specific engagement fields. Use this instead of the main YouTube Scraper when the Shorts shelf is the unit of analysis. Pricing: ~$2.40 / 1,000 Shorts. 4.74★ across 44k users.

---

## 5. YouTube Transcript Scraper (Captions + AI Fallback)

**Actor ID:** `codepoetry/youtube-transcript-ai-scraper`
**API path:** `https://api.apify.com/v2/acts/codepoetry~youtube-transcript-ai-scraper/runs`

### Input

| Field                | Type    | Description                                                  |
| -------------------- | ------- | ------------------------------------------------------------ |
| `videoUrls`          | array   | YouTube video or Shorts URLs                                 |
| `language`           | string  | Preferred caption language code (e.g. `en`)                  |
| `enableAiFallback`   | boolean | Use Whisper AI transcription when captions unavailable       |
| `maxAiMinutes`       | integer | Cap on AI transcription minutes per run (cost control)       |
| `dryRun`             | boolean | Estimate cost without running — preview before large batches |
| `proxyConfiguration` | object  | Proxy settings                                               |

```json
{
  "videoUrls": [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=9bZkp7q19f0"
  ],
  "language": "en",
  "enableAiFallback": true,
  "maxAiMinutes": 60,
  "dryRun": false
}
```

### Output

| Field              | Type    | Description                                                                   |
| ------------------ | ------- | ----------------------------------------------------------------------------- |
| `videoId`          | string  | YouTube video ID                                                              |
| `videoUrl`         | string  | Watch URL                                                                     |
| `videoTitle`       | string  | Video title                                                                   |
| `channelName`      | string  | Channel name                                                                  |
| `duration`         | integer | Duration in seconds                                                           |
| `language`         | string  | Detected caption language                                                     |
| `transcriptSource` | string  | `native_captions`, `auto_generated`, or `whisper_ai`                          |
| `transcript_json`  | array   | Timestamped segments `[{start, duration, text}]` for UI playback              |
| `transcript_llm`   | string  | Filler-stripped, chunked plain text — drop directly into LangChain/LlamaIndex |
| `transcript_srt`   | string  | SubRip subtitle format                                                        |
| `transcript_vtt`   | string  | WebVTT subtitle format                                                        |
| `hasCaptions`      | boolean | Whether native captions were found                                            |
| `aiUsedMinutes`    | number  | Minutes of Whisper AI compute used (billed separately)                        |

**Description:** Two-pass transcript pipeline. First pass fetches native caption track (manual or auto-generated) — sub-second per video, $0.70/1k. Videos without captions fall back to a bundled Whisper model running on Apify compute. The `transcript_llm` field is filler-stripped and chunked — ready for RAG pipelines, summarization, or LLM fine-tuning with no post-processing. Use `dryRun: true` before large unknown playlists to preview AI compute cost. Note: newer actor (64 users, 94% success) — keep a retry wrapper on the Whisper path. Pricing: ~$0.70 / 1,000 native transcripts + AI-minute charges for Whisper fallback.

---

## 6. YouTube Video Downloader

**Actor ID:** `epctex/youtube-video-downloader`
**API path:** `https://api.apify.com/v2/acts/epctex~youtube-video-downloader/runs`

### Input

| Field                | Type   | Description                                          |
| -------------------- | ------ | ---------------------------------------------------- |
| `startUrls`          | array  | YouTube video watch URLs                             |
| `quality`            | string | `highest`, `1080p`, `720p`, `480p`, `360p`, `lowest` |
| `format`             | string | `mp4`, `webm`, `audio_only`                          |
| `proxyConfiguration` | object | Residential proxies required for reliable resolution |

```json
{
  "startUrls": [{ "url": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID" }],
  "quality": "720p",
  "format": "mp4"
}
```

### Output

| Field         | Type    | Description                                         |
| ------------- | ------- | --------------------------------------------------- |
| `videoId`     | string  | YouTube video ID                                    |
| `title`       | string  | Video title                                         |
| `url`         | string  | Original watch URL                                  |
| `downloadUrl` | string  | Temporary signed download URL for the MP4/WebM file |
| `quality`     | string  | Actual resolution returned                          |
| `format`      | string  | File format                                         |
| `fileSize`    | integer | File size in bytes                                  |
| `duration`    | integer | Duration in seconds                                 |
| `channelName` | string  | Uploader channel name                               |
| `uploadDate`  | string  | ISO 8601 upload date                                |

> ⚠️ **Legal notice:** YouTube's Terms of Service prohibit downloading content you do not own or have an explicit licence for. Only use this actor on your own channel's content, licensed material, or videos with written creator permission. Residential proxies are required for reliable resolution (see README).

**Description:** Rental-model actor ($30/month + platform usage). Returns a temporary signed URL pointing to the downloaded file stored in Apify key-value storage. 99.9% success rate and a stable schema make it reliable for licensed media archival workflows. Pricing: $30/month rental + usage.

---

## Why Apify Instead of YouTube Data API v3?

| Dimension                  | YouTube Data API v3                          | Apify Scrapers                      |
| -------------------------- | -------------------------------------------- | ----------------------------------- |
| Daily quota                | 10,000 units/day (`search.list` = 100 units) | No quota — pay per result           |
| Cost at 50k videos         | Requires quota extension request             | ~$120 (YouTube Scraper)             |
| Comment replies            | Gated/paginated, counts against quota        | Full threads with `includeReplies`  |
| Channel join date          | Not exposed                                  | Available in Channel Scraper        |
| Auto-generated transcripts | Not available via API                        | Available via Transcript Scraper    |
| Shorts-native fields       | Partial                                      | Full via Shorts Scraper             |
| Setup                      | Requires Google Cloud project + OAuth        | No API key — only Apify token       |
| Scheduling                 | Manual cron via your infra                   | Built-in Apify Schedules + webhooks |

---

## Universal Notes

- **No login required** for all actors — all data is scraped from public YouTube surfaces.
- **Subtitles:** The main YouTube Scraper can extract subtitles inline (`saveSubtitles: true`). For AI/RAG pipelines or Whisper fallback on caption-free videos, use the dedicated Transcript Scraper.
- **Comments vs main scraper:** Use the Comments Scraper when threads are the deliverable — it's 2.7× cheaper per item than pulling comments through the main scraper.
- **Shorts fields:** `isShort`, vertical `duration`, and Shorts-shelf position are normalised away by the long-form Video Scraper — use the Shorts Scraper for those fields.
- **Scheduling:** All actors support Apify Schedules and webhook triggers for automated periodic runs.
- **Integrations:** Connect output to Google Drive, Airtable, Slack, Make, n8n, or Zapier via the Apify API.
- **Free tier:** Apify provides $5.00 in free monthly credits (~2,000 videos or ~5,500 comments).
