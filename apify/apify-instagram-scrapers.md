# Apify Instagram Scrapers — Reference Guide

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
> Output formats available for all actors: **JSON, CSV, Excel (XLSX), XML, HTML**

---

## Actor Comparison

| Actor                             | Price      | Rating | Best for                                                      |
| --------------------------------- | ---------- | ------ | ------------------------------------------------------------- |
| Instagram Scraper                 | $1.50 / 1k | 4.73★  | Mixed inputs: profiles, hashtags, places, post URLs, comments |
| Instagram Post Scraper            | $1.00 / 1k | 4.45★  | Post-level brand listening; one row per post                  |
| Instagram Profile Scraper         | $1.60 / 1k | 4.66★  | Influencer vetting, CRM enrichment, lead gen                  |
| Instagram Reel Scraper            | $1.00 / 1k | 4.73★  | Short-form analytics, transcripts, video downloads            |
| Instagram Hashtag Scraper         | $1.90 / 1k | 3.07★  | Campaign tracking, UGC discovery by hashtag                   |
| Instagram Followers Count Scraper | $1.30 / 1k | 4.86★  | Lightweight scheduled follower/following snapshots            |

_Prices confirmed on Apify Store on 2026-04-17. All are pay-per-event — no platform usage surcharge._

---

## 1. Instagram Scraper

**Actor ID:** `apify/instagram-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~instagram-scraper/runs`

### Input

| Field               | Type    | Description                                                                 |
| ------------------- | ------- | --------------------------------------------------------------------------- |
| `directUrls`        | array   | One or more Instagram URLs — profile, hashtag page, place page, or post URL |
| `resultsType`       | string  | `posts`, `comments`, or `details` (profile metadata)                        |
| `resultsLimit`      | integer | Max items to return per URL                                                 |
| `searchType`        | string  | `user`, `hashtag`, or `place` (used with `searchQueries`)                   |
| `searchQueries`     | array   | Keywords to search when using `searchType`                                  |
| `proxy`             | object  | Proxy configuration (residential recommended)                               |
| `maxRequestRetries` | integer | Retry limit on failed requests                                              |

```json
{
  "directUrls": [
    "https://www.instagram.com/nasa/",
    "https://www.instagram.com/explore/tags/space/"
  ],
  "resultsType": "posts",
  "resultsLimit": 50
}
```

### Output

| Field                 | Type    | Description                                        |
| --------------------- | ------- | -------------------------------------------------- |
| `id`                  | string  | Post or profile ID                                 |
| `type`                | string  | `GraphImage`, `GraphVideo`, `GraphSidecar`         |
| `shortCode`           | string  | Post short code (used in URL)                      |
| `caption`             | string  | Full post caption text                             |
| `hashtags`            | array   | Hashtags extracted from caption                    |
| `mentions`            | array   | @mentions in the caption                           |
| `url`                 | string  | Direct URL to the post                             |
| `commentsCount`       | integer | Total comment count                                |
| `likesCount`          | integer | Total like/reaction count                          |
| `timestamp`           | string  | ISO 8601 publish date                              |
| `images`              | array   | URLs of post images                                |
| `videoUrl`            | string  | Video URL (if applicable)                          |
| `videoViewCount`      | integer | View count (videos only)                           |
| `locationName`        | string  | Tagged location name                               |
| `ownerUsername`       | string  | Username of the poster                             |
| `ownerFullName`       | string  | Display name of the poster                         |
| `ownerFollowersCount` | integer | Follower count of the poster                       |
| `comments`            | array   | Recent comments (when `resultsType` is `comments`) |

**Description:** The only official Actor that accepts profiles, hashtags, places, and post URLs in a single input. Use when a pipeline needs deep comment threads from a list of post URLs — dedicated Post and Reel Actors only expose recent comments. Pricing: ~$1.50 / 1,000 results.

---

## 2. Instagram Post Scraper

**Actor ID:** `apify/instagram-post-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~instagram-post-scraper/runs`

### Input

| Field          | Type    | Description                       |
| -------------- | ------- | --------------------------------- |
| `username`     | string  | Instagram username or profile URL |
| `resultsLimit` | integer | Max posts to retrieve per profile |
| `proxy`        | object  | Proxy configuration               |

```json
{
  "username": "natgeo",
  "resultsLimit": 100
}
```

### Output

| Field               | Type    | Description                            |
| ------------------- | ------- | -------------------------------------- |
| `id`                | string  | Post ID                                |
| `shortCode`         | string  | Post short code                        |
| `url`               | string  | Full post URL                          |
| `caption`           | string  | Post caption text                      |
| `hashtags`          | array   | Hashtags in caption                    |
| `mentions`          | array   | @mentions in caption                   |
| `timestamp`         | string  | ISO 8601 publish date                  |
| `likesCount`        | integer | Like count                             |
| `commentsCount`     | integer | Comment count                          |
| `videoViewCount`    | integer | Video view count (if video)            |
| `isSponsored`       | boolean | Whether the post is a paid partnership |
| `coauthorProducers` | array   | Co-author profile info (collab posts)  |
| `latestComments`    | array   | Most recent comment objects            |
| `images`            | array   | Image URLs                             |
| `videoUrl`          | string  | Video URL (if video post)              |
| `ownerUsername`     | string  | Poster's username                      |

**Description:** Username-in, posts-out. Fastest and cheapest path to structured post feeds. Ideal for brand listening, competitor analysis, and content research when every row must be a post. Includes sponsored flag and co-author data not available in other scrapers. Pricing: ~$1.00 / 1,000 posts.

---

## 3. Instagram Profile Scraper

**Actor ID:** `apify/instagram-profile-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs`

### Input

| Field       | Type   | Description                               |
| ----------- | ------ | ----------------------------------------- |
| `usernames` | array  | Instagram usernames, IDs, or profile URLs |
| `proxy`     | object | Proxy configuration                       |

```json
{
  "usernames": ["nasa", "natgeo", "bbcnews"]
}
```

### Output

| Field                | Type    | Description                                            |
| -------------------- | ------- | ------------------------------------------------------ |
| `username`           | string  | Instagram handle                                       |
| `fullName`           | string  | Display name                                           |
| `id`                 | string  | Numeric Instagram user ID                              |
| `biography`          | string  | Profile bio text                                       |
| `website`            | string  | External website URL in bio                            |
| `email`              | string  | Business email (if publicly listed)                    |
| `followersCount`     | integer | Number of followers                                    |
| `followsCount`       | integer | Number of accounts followed                            |
| `postsCount`         | integer | Total post count                                       |
| `isVerified`         | boolean | Verification badge status                              |
| `isBusinessAccount`  | boolean | Whether it's a business profile                        |
| `businessCategory`   | string  | Business category label                                |
| `joinDate`           | string  | Approximate account creation date                      |
| `profilePicUrl`      | string  | Profile picture URL                                    |
| `latestPosts`        | array   | Last ~12 posts (shortCode, URL, likesCount, timestamp) |
| `relatedProfiles`    | array   | Suggested/related profile handles                      |
| `highlightReelCount` | integer | Number of highlight reels                              |

**Description:** Extracts complete public profile data from a list of usernames. Returns 33+ fields per account including bio, contact info, verification status, and a recent post preview. Ideal for influencer vetting and CRM enrichment at scale. For follower counts only, use the Followers Count Scraper instead. Pricing: ~$1.60 / 1,000 profiles.

---

## 4. Instagram Reel Scraper

**Actor ID:** `apify/instagram-reel-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~instagram-reel-scraper/runs`

### Input

| Field                | Type    | Description                                                |
| -------------------- | ------- | ---------------------------------------------------------- |
| `directUrls`         | array   | Profile URLs, usernames, or individual reel URLs           |
| `resultsLimit`       | integer | Max reels to extract per profile                           |
| `newerThan`          | string  | Date lower bound — YYYY-MM-DD or relative (e.g. `30 days`) |
| `skipPinnedReels`    | boolean | Exclude pinned reels from results                          |
| `includeTopComments` | boolean | Collect top comments per reel                              |
| `proxy`              | object  | Proxy configuration                                        |

```json
{
  "directUrls": ["https://www.instagram.com/nasa/"],
  "resultsLimit": 50,
  "newerThan": "3 months",
  "includeTopComments": true
}
```

### Output

| Field                 | Type    | Description                      |
| --------------------- | ------- | -------------------------------- |
| `id`                  | string  | Reel ID                          |
| `url`                 | string  | Direct reel URL                  |
| `caption`             | string  | Reel caption text                |
| `hashtags`            | array   | Hashtags in caption              |
| `mentions`            | array   | @mentions in caption             |
| `timestamp`           | string  | ISO 8601 publish date            |
| `likesCount`          | integer | Like count                       |
| `commentsCount`       | integer | Comment count                    |
| `sharesCount`         | integer | Share count                      |
| `playsCount`          | integer | Total play count                 |
| `duration`            | integer | Reel duration in seconds         |
| `videoUrl`            | string  | Downloadable MP4 URL             |
| `thumbnailUrl`        | string  | Reel thumbnail image URL         |
| `transcript`          | string  | Auto-generated speech transcript |
| `musicInfo`           | object  | Audio track name and artist      |
| `taggedUsers`         | array   | Users tagged in the reel         |
| `ownerUsername`       | string  | Creator's username               |
| `ownerFollowersCount` | integer | Creator's follower count         |

**Description:** Extracts detailed data from public Instagram Reels including transcripts, shares, and downloadable MP4 links — fields not available in the Post Scraper. Best paired with Hashtag Scraper for trend discovery → Reel Scraper for full field extraction. Pricing: ~$1.00 / 1,000 reels.

---

## 5. Instagram Hashtag Scraper

**Actor ID:** `apify/instagram-hashtag-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/runs`

### Input

| Field             | Type    | Description                                                |
| ----------------- | ------- | ---------------------------------------------------------- |
| `hashtags`        | array   | Hashtags to scrape (without `#`)                           |
| `resultsLimit`    | integer | Max posts/reels per hashtag                                |
| `contentType`     | string  | `posts`, `reels`, or `all`                                 |
| `scrapeByKeyword` | boolean | Enable keyword-based search mode instead of strict hashtag |
| `proxy`           | object  | Proxy configuration                                        |

```json
{
  "hashtags": ["travelphotography", "streetfood"],
  "resultsLimit": 100,
  "contentType": "reels"
}
```

### Output

| Field            | Type    | Description                                    |
| ---------------- | ------- | ---------------------------------------------- |
| `id`             | string  | Post or reel ID                                |
| `url`            | string  | Direct post URL                                |
| `caption`        | string  | Caption text                                   |
| `hashtags`       | array   | All hashtags used in the post                  |
| `timestamp`      | string  | ISO 8601 publish date                          |
| `likesCount`     | integer | Like count                                     |
| `playsCount`     | integer | Play count (reels/videos)                      |
| `commentsCount`  | integer | Comment count                                  |
| `sharesCount`    | integer | Share count                                    |
| `videoLength`    | integer | Video duration in seconds                      |
| `images`         | array   | Image/thumbnail URLs                           |
| `audioInfo`      | object  | Audio track metadata                           |
| `latestComments` | array   | 10 latest comments (when keyword mode enabled) |
| `ownerUsername`  | string  | Poster's username                              |
| `locationName`   | string  | Tagged location                                |

**Description:** Extracts posts and reels associated with one or more hashtags. The lowest-rated of the six first-party scrapers (3.07★) because hashtag ranking is Instagram's most volatile surface — results may be thin or reordered during UI changes. Use Instagram Scraper with hashtag inputs as a more stable alternative. Pricing: ~$1.90 / 1,000 results.

---

## 6. Instagram Followers Count Scraper

**Actor ID:** `apify/instagram-followers-count-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~instagram-followers-count-scraper/runs`

### Input

| Field       | Type   | Description                         |
| ----------- | ------ | ----------------------------------- |
| `usernames` | array  | Instagram usernames or profile URLs |
| `proxy`     | object | Proxy configuration                 |

```json
{
  "usernames": ["nasa", "natgeo", "bbcnews", "nytimes"]
}
```

### Output

| Field               | Type    | Description                          |
| ------------------- | ------- | ------------------------------------ |
| `username`          | string  | Instagram handle                     |
| `url`               | string  | Profile URL                          |
| `followersCount`    | integer | Number of followers                  |
| `followsCount`      | integer | Number of accounts followed          |
| `postsCount`        | integer | Total post count                     |
| `bio`               | string  | Profile bio text                     |
| `lastPostTimestamp` | string  | Publish date of the most recent post |

**Description:** A lightweight scraper returning only follower/following counts and basic profile metadata per handle. The tiny payload makes it safe and cheap enough to schedule hourly across large rosters. The highest-rated of the six Instagram scrapers (4.86★). Use Profile Scraper instead when you need full bios, contact info, or recent post previews. Pricing: ~$1.30 / 1,000 profiles.

---

## Universal Notes

- **Authentication:** No login required for public data. Session cookies may be needed for private account data (unsupported by most first-party Actors by design).
- **Proxy:** Residential proxies are the default on all six actors and are included in Apify's Starter plan ($29/mo). Keep `resultsLimit` below 200 per input on first runs to avoid soft blocks.
- **Scheduling:** All actors support Apify Schedules and webhook triggers for automated periodic runs.
- **Integrations:** Connect output to Google Drive, Airtable, Slack, Make, n8n, Zapier, or any REST endpoint via the Apify API.
- **Free tier:** Apify provides $5.00 in free monthly credits (~3,300 posts/month on Post Scraper).
- **Stories & DMs:** Not reliably supported — Instagram gates ephemeral and private content behind logged-in sessions. Always validate with a 5–10 item pilot before scaling.
- **Rate limiting:** If runs return partial or empty datasets, check the Actor's Issues tab before retrying — Instagram rendering changes typically appear as a wave of new issues within a day.
