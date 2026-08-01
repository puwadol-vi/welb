# Apify Facebook Scrapers — Reference Guide

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

## 1. Facebook Posts Scraper

**Actor ID:** `apify/facebook-posts-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~facebook-posts-scraper/runs`

### Input

| Field                     | Type    | Description                                                                      |
| ------------------------- | ------- | -------------------------------------------------------------------------------- |
| `startUrls`               | array   | Facebook Page or Profile URLs (e.g. `https://www.facebook.com/humansofnewyork/`) |
| `maxPosts`                | integer | Max number of posts to retrieve                                                  |
| `newerThan`               | string  | Date lower bound — YYYY-MM-DD or relative (e.g. `2 months`)                      |
| `olderThan`               | string  | Date upper bound — YYYY-MM-DD or relative                                        |
| `includeVideoTranscripts` | boolean | Extract transcript text from videos                                              |
| `proxyConfiguration`      | object  | Proxy settings                                                                   |

```json
{
  "startUrls": [{ "url": "https://www.facebook.com/humansofnewyork/" }],
  "maxPosts": 100,
  "newerThan": "3 months",
  "includeVideoTranscripts": false
}
```

### Output

| Field           | Type    | Description                                |
| --------------- | ------- | ------------------------------------------ |
| `postText`      | string  | Full text content of the post              |
| `postUrl`       | string  | Direct URL to the post                     |
| `pageUrl`       | string  | URL of the source page/profile             |
| `timestamp`     | string  | ISO 8601 publish date                      |
| `likesCount`    | integer | Number of likes/reactions                  |
| `sharesCount`   | integer | Number of shares                           |
| `commentsCount` | integer | Number of comments                         |
| `pageDetails`   | object  | Name, category, follower count of the page |
| `postThumbnail` | string  | URL of the post image/thumbnail            |

**Description:** Scrapes public posts, reels, and videos from pages, profiles, and public groups. Used for tracking content performance, engagement trends, and competitor analysis. Pricing: ~$4.00 / 1,000 posts.

---

## 2. Facebook Groups Scraper

**Actor ID:** `apify/facebook-groups-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~facebook-groups-scraper/runs`

### Input

| Field                | Type    | Description                                                               |
| -------------------- | ------- | ------------------------------------------------------------------------- |
| `startUrls`          | array   | Public Facebook Group URL(s)                                              |
| `maxPosts`           | integer | Post count limit                                                          |
| `sortBy`             | string  | `CHRONOLOGICAL`, `RECENT_ACTIVITY`, `TOP_POSTS`, `CHRONOLOGICAL_LISTINGS` |
| `searchByLetter`     | string  | Filter posts within group by 1–2 letter search                            |
| `scrapePostsAfter`   | string  | Date filter — YYYY-MM-DD                                                  |
| `proxyConfiguration` | object  | Proxy settings                                                            |
| `cookies`            | array   | Session cookies (optional, for private groups)                            |

```json
{
  "startUrls": [{ "url": "https://www.facebook.com/groups/123456789/" }],
  "maxPosts": 200,
  "sortBy": "CHRONOLOGICAL",
  "scrapePostsAfter": "2025-01-01"
}
```

### Output

| Field           | Type    | Description                |
| --------------- | ------- | -------------------------- |
| `groupUrl`      | string  | URL of the group           |
| `postText`      | string  | Full text of the post      |
| `postUrl`       | string  | Direct URL to the post     |
| `authorName`    | string  | Display name of the poster |
| `authorUrl`     | string  | Profile URL of the poster  |
| `timestamp`     | string  | ISO 8601 publish date      |
| `likesCount`    | integer | Reaction count             |
| `commentsCount` | integer | Number of comments         |
| `comments`      | array   | Nested comment objects     |

**Description:** Extracts posts, comments, and user information from Facebook groups. Supports sorting and date filtering. Useful for community research, social listening, and trend analysis. Pricing: ~$4.00 / 1,000 posts.

---

## 3. Facebook Ads Scraper (Meta Ad Library)

**Actor ID:** `apify/facebook-ads-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~facebook-ads-scraper/runs`

### Input

| Field                | Type   | Description                                                         |
| -------------------- | ------ | ------------------------------------------------------------------- |
| `startUrls`          | array  | Facebook Page URLs or Meta Ad Library search URLs                   |
| `country`            | string | Country code — `US`, `GB`, `ALL`, etc.                              |
| `adType`             | string | `all`, `political_and_issue_ads`, `housing`, `credit`, `employment` |
| `activeStatus`       | string | `active` or `inactive`                                              |
| `mediaType`          | string | `image`, `video`, `meme`, `none`, `all`                             |
| `keyword`            | string | Keyword filter within ads                                           |
| `startDateMin`       | string | Ad start date lower bound (YYYY-MM-DD)                              |
| `startDateMax`       | string | Ad start date upper bound (YYYY-MM-DD)                              |
| `proxyConfiguration` | object | Proxy settings                                                      |

```json
{
  "startUrls": [
    {
      "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=shoes"
    }
  ],
  "activeStatus": "active",
  "mediaType": "video"
}
```

### Output

| Field                | Type    | Description                                         |
| -------------------- | ------- | --------------------------------------------------- |
| `adText`             | string  | Body copy of the ad                                 |
| `adTitle`            | string  | Headline/title of the ad                            |
| `adUrl`              | string  | Link URL of the ad                                  |
| `adType`             | string  | Ad category type                                    |
| `adSpend`            | object  | Estimated spend range (min/max)                     |
| `startDate`          | string  | When the ad started running                         |
| `endDate`            | string  | When the ad stopped (if inactive)                   |
| `images`             | array   | URLs of ad creative images                          |
| `ctaType`            | string  | Call-to-action label (e.g. `Shop Now`)              |
| `reachEstimates`     | object  | Audience reach range                                |
| `reportCount`        | integer | Number of reports against the ad                    |
| `platforms`          | array   | Platforms the ad ran on (Facebook, Instagram, etc.) |
| `pageVerified`       | boolean | Whether the advertiser page is verified             |
| `aiContentFlag`      | boolean | Meta's AI-generated content flag                    |
| `euTransparencyData` | object  | EU-specific targeting/spend data                    |

**Description:** Extracts advertising data from the Meta Ad Library across Facebook, Instagram, WhatsApp, Threads, Messenger, and Audience Network. Returns up to 57 fields per ad. Ideal for competitor monitoring, ad creative research, and regulatory reporting. Pricing: ~$5.00 / 1,000 ads.

---

## 4. Facebook Comments Scraper

**Actor ID:** `apify/facebook-comments-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~facebook-comments-scraper/runs`

### Input

| Field                | Type    | Description                        |
| -------------------- | ------- | ---------------------------------- |
| `startUrls`          | array   | Facebook post, video, or reel URLs |
| `sortBy`             | string  | `MOST_RELEVANT` or `NEWEST_FIRST`  |
| `maxComments`        | integer | Max comments to retrieve per post  |
| `proxyConfiguration` | object  | Proxy settings                     |

```json
{
  "startUrls": [{ "url": "https://www.facebook.com/photo/?fbid=123456789" }],
  "sortBy": "NEWEST_FIRST",
  "maxComments": 500
}
```

### Output

| Field           | Type    | Description                        |
| --------------- | ------- | ---------------------------------- |
| `commentText`   | string  | Full text of the comment           |
| `commentId`     | string  | Unique comment ID                  |
| `commenterName` | string  | Display name of commenter          |
| `commenterUrl`  | string  | Profile URL of commenter           |
| `timestamp`     | string  | ISO 8601 timestamp                 |
| `likesCount`    | integer | Number of likes on the comment     |
| `reactionTypes` | object  | Breakdown by reaction type         |
| `replies`       | array   | Nested reply objects (same schema) |
| `postUrl`       | string  | Source post URL                    |

**Description:** Extracts publicly available comments from Facebook posts, videos, and reels. Supports sorting by relevance or recency. Used for sentiment analysis, brand feedback monitoring, and audience research. Pricing: ~$2.00 / 1,000 comments.

---

## 5. Facebook Pages Scraper

**Actor ID:** `apify/facebook-pages-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~facebook-pages-scraper/runs`

### Input

| Field                | Type   | Description                                                       |
| -------------------- | ------ | ----------------------------------------------------------------- |
| `startUrls`          | array  | Facebook Page URLs or usernames                                   |
| `proxyConfiguration` | object | Proxy settings (auto-fallback: direct → datacenter → residential) |

```json
{
  "startUrls": [{ "url": "https://www.facebook.com/nasa" }, { "url": "nike" }]
}
```

### Output

| Field                | Type    | Description                       |
| -------------------- | ------- | --------------------------------- |
| `pageName`           | string  | Display name of the page          |
| `facebookUrl`        | string  | Full page URL                     |
| `description`        | string  | Page about/bio text               |
| `categories`         | array   | Page category labels              |
| `verificationStatus` | boolean | Whether the page is verified      |
| `followerCount`      | integer | Number of followers               |
| `likesCount`         | integer | Number of page likes              |
| `rating`             | float   | Star rating (1–5, if available)   |
| `reviewCount`        | integer | Total number of reviews           |
| `email`              | string  | Contact email address             |
| `phone`              | string  | Contact phone number              |
| `website`            | string  | External website URL              |
| `address`            | string  | Physical address                  |
| `location`           | object  | City, state, country, coordinates |
| `hoursOfOperation`   | object  | Opening hours per day             |
| `priceRange`         | string  | Price range indicator (e.g. `$$`) |
| `creationDate`       | string  | Page creation date                |
| `adLibraryStatus`    | string  | Whether the page runs ads         |
| `messengerUrl`       | string  | Messenger link                    |
| `socialLinks`        | array   | Other social media profile URLs   |

**Description:** Extracts structured business data from public Facebook Pages. Supports bulk input of multiple URLs or usernames. Ideal for lead generation, market research, and competitive benchmarking. Pricing: ~$6.60 / 1,000 pages.

---

## 6. Facebook Reviews Scraper

**Actor ID:** `apify/facebook-reviews-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~facebook-reviews-scraper/runs`

### Input

| Field                | Type    | Description                                                         |
| -------------------- | ------- | ------------------------------------------------------------------- |
| `startUrls`          | array   | Facebook Page URLs, reviews URLs, page handles, or numeric Page IDs |
| `maxReviews`         | integer | Max number of reviews to retrieve                                   |
| `proxyConfiguration` | object  | Residential proxies required                                        |

```json
{
  "startUrls": [{ "url": "https://www.facebook.com/starbucks/reviews" }],
  "maxReviews": 300
}
```

### Output

| Field                  | Type    | Description                      |
| ---------------------- | ------- | -------------------------------- |
| `reviewId`             | string  | Unique review ID                 |
| `permalink`            | string  | Direct URL to the review         |
| `date`                 | string  | ISO 8601 publish date            |
| `recommendationStatus` | string  | `POSITIVE` or `NEGATIVE`         |
| `reviewText`           | string  | Full review text                 |
| `tags`                 | array   | Tags attached to the review      |
| `likesCount`           | integer | Number of likes on the review    |
| `commentsCount`        | integer | Number of comments on the review |
| `reviewerName`         | string  | Display name of the reviewer     |
| `reviewerUrl`          | string  | Profile URL of the reviewer      |
| `nestedComments`       | array   | Comments under the review        |
| `replies`              | array   | Page owner replies               |
| `pageUrl`              | string  | Source page URL                  |
| `pageId`               | string  | Numeric Facebook Page ID         |

**Description:** Extracts public Facebook Page recommendations and star reviews. Can help detect fake reviews by identifying patterns such as duplicate text, unusual account age, or suspiciously high ratings. Pricing: ~$2.00 / 1,000 reviews.

---

## 7. Facebook Reels Scraper

**Actor ID:** `apify/facebook-reels-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~facebook-reels-scraper/runs`

### Input

| Field                | Type    | Description                      |
| -------------------- | ------- | -------------------------------- |
| `startUrls`          | array   | Facebook Page or Profile URLs    |
| `maxReels`           | integer | Max number of reels to retrieve  |
| `includePageDetails` | boolean | Also extract page-level metadata |
| `proxyConfiguration` | object  | Proxy settings                   |

```json
{
  "startUrls": [{ "url": "https://www.facebook.com/nasa" }],
  "maxReels": 50,
  "includePageDetails": true
}
```

### Output

| Field           | Type    | Description                              |
| --------------- | ------- | ---------------------------------------- |
| `reelUrl`       | string  | Direct URL to the reel                   |
| `caption`       | string  | Reel caption/text                        |
| `pageUrl`       | string  | Source page/profile URL                  |
| `timestamp`     | string  | ISO 8601 publish date                    |
| `playsCount`    | integer | Total play count                         |
| `likesCount`    | integer | Number of likes                          |
| `commentsCount` | integer | Number of comments                       |
| `sharesCount`   | integer | Number of shares                         |
| `videoUrlHd`    | string  | HD video download URL                    |
| `videoUrlSd`    | string  | SD video download URL                    |
| `audioMetadata` | object  | Audio track info (name, artist)          |
| `pageName`      | string  | Page/profile display name                |
| `followerCount` | integer | Follower count (if `includePageDetails`) |
| `pageCategory`  | string  | Page category label                      |
| `pageBio`       | string  | Page bio/description                     |

**Description:** Extracts reels from public Facebook pages and profiles including 30+ fields per reel — captions, engagement metrics, and direct HD/SD video download links. No account needed. Pricing: ~$2.00 / 1,000 reels.

---

## 8. Facebook Search Scraper

**Actor ID:** `apify/facebook-search-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~facebook-search-scraper/runs`

### Input

| Field                | Type    | Description                      |
| -------------------- | ------- | -------------------------------- |
| `searchQuery`        | string  | Keyword(s) to search on Facebook |
| `maxResults`         | integer | Max number of page results       |
| `proxyConfiguration` | object  | Proxy settings                   |

```json
{
  "searchQuery": "coffee shop Bangkok",
  "maxResults": 50
}
```

### Output

| Field           | Type    | Description                         |
| --------------- | ------- | ----------------------------------- |
| `pageUrl`       | string  | URL of the matched page             |
| `pageName`      | string  | Display name of the page            |
| `address`       | string  | Physical address                    |
| `email`         | string  | Contact email                       |
| `website`       | string  | External website URL                |
| `checkIns`      | integer | Number of check-ins                 |
| `creationDate`  | string  | Page creation date                  |
| `adStatus`      | string  | Whether the page currently runs ads |
| `category`      | string  | Page category                       |
| `followerCount` | integer | Number of followers                 |
| `messengerLink` | string  | Messenger URL                       |

**Description:** Discovers Facebook Pages by keyword when no official API supports it. Returns structured page-level metadata for all matching results. Best used for lead discovery and competitor research by topic or location.

---

## 9. Facebook Followers & Following Scraper

**Actor ID:** `apify/facebook-followers-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~facebook-followers-scraper/runs`

### Input

| Field                | Type    | Description                                     |
| -------------------- | ------- | ----------------------------------------------- |
| `startUrls`          | array   | Facebook Page or Profile URLs                   |
| `maxItems`           | integer | Max followers/following to retrieve             |
| `cookies`            | array   | Session cookies (required for login-gated data) |
| `proxyConfiguration` | object  | Proxy settings                                  |

```json
{
  "startUrls": [{ "url": "https://www.facebook.com/someprofile" }],
  "maxItems": 1000
}
```

### Output

| Field           | Type    | Description                            |
| --------------- | ------- | -------------------------------------- |
| `profileName`   | string  | Display name of the follower/following |
| `profileUrl`    | string  | Facebook profile URL                   |
| `profileId`     | string  | Numeric Facebook user/page ID          |
| `followerCount` | integer | Their follower count (if available)    |
| `sourcePageUrl` | string  | The page being analyzed                |

**Description:** Extracts lists of followers or accounts that a page follows. Useful for influencer analysis, audience profiling, and understanding who engages with a brand or creator. Login session cookies are typically required.

---

## 10. Facebook Events Scraper

**Actor ID:** `apify/facebook-events-scraper`
**API path:** `https://api.apify.com/v2/acts/apify~facebook-events-scraper/runs`

### Input

| Field                | Type    | Description                             |
| -------------------- | ------- | --------------------------------------- |
| `startUrls`          | array   | Facebook Page URLs or direct Event URLs |
| `maxEvents`          | integer | Max events to retrieve                  |
| `proxyConfiguration` | object  | Proxy settings                          |

```json
{
  "startUrls": [
    { "url": "https://www.facebook.com/events/search/?q=music+festival" }
  ],
  "maxEvents": 100
}
```

### Output

| Field             | Type    | Description                          |
| ----------------- | ------- | ------------------------------------ |
| `eventName`       | string  | Name/title of the event              |
| `eventUrl`        | string  | Direct URL to the event              |
| `startDate`       | string  | ISO 8601 event start date/time       |
| `endDate`         | string  | ISO 8601 event end date/time         |
| `location`        | string  | Venue name and address               |
| `description`     | string  | Full event description text          |
| `organizerName`   | string  | Name of the organizing page/profile  |
| `organizerUrl`    | string  | URL of the organizer                 |
| `attendingCount`  | integer | Number of users marked as attending  |
| `interestedCount` | integer | Number of users marked as interested |
| `coverImageUrl`   | string  | Event cover photo URL                |

**Description:** Extracts event details from Facebook Pages or event search results. Useful for venue tracking, competitor event monitoring, and aggregating local listings into an external platform or calendar system.

---

## Universal Notes

- **Authentication:** No login required for public data. Session cookies (`cookies` field) may be needed for private groups or following/follower data.
- **Proxy:** Residential proxies are included on Apify's Starter plan ($29/mo) and higher. The platform auto-handles rotation and CAPTCHA solving.
- **Scheduling:** All actors support Apify Schedules and webhook triggers for automated periodic runs.
- **Integrations:** Connect output to Google Drive, Airtable, Slack, Make, n8n, Zapier, or any REST endpoint via the Apify API.
- **Free tier:** Apify provides $5.00 in free monthly credits to test any actor.
