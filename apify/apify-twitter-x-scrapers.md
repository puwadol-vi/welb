# Apify Twitter / X Scrapers — Reference Guide

> **Context:** X (Twitter) removed its free API in 2023. The Basic tier costs ~$200/month with capped read limits; the Pro tier is ~$5,000/month. For read-only public research, Apify scrapers at $0.25–$0.40 per 1,000 tweets are 5–20× cheaper at realistic volumes with no monthly minimum.

> The official `apify/twitter-scraper` listing is now a **router** — it redirects to the community actors below. Go directly to the actor that fits your input type.

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

| Actor                     | Actor ID                                                            | Price                       | Rating | Best for                                                    |
| ------------------------- | ------------------------------------------------------------------- | --------------------------- | ------ | ----------------------------------------------------------- |
| Twitter Scraper Unlimited | `apidojo/twitter-scraper-lite`                                      | Pay per event               | 4.1★   | Default pick — search, URLs, profiles, lists, threads       |
| Tweet Scraper V2          | `apidojo/tweet-scraper`                                             | $0.40 / 1k tweets           | 3.99★  | High-volume keyword/advanced-search pulls, 30–80 tweets/sec |
| Cheapest Tweet Scraper    | `kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest` | $0.25 / 1k tweets           | 4.44★  | Lowest cost per tweet at scale                              |
| Twitter User Scraper      | `apidojo/twitter-user-scraper`                                      | Pay per event               | 4.1★   | Profiles + followers + following + retweeters               |
| Twitter List Scraper      | `apidojo/twitter-list-scraper`                                      | $0.008/list + $0.0004/tweet | 4.3★   | Extracting tweets and members from X Lists                  |
| Twitter Profile Scraper   | `epctex/twitter-profile-scraper`                                    | $10/mo rental + usage       | 4.22★  | Profile-only metadata with stable schema                    |

_Prices and ratings verified on Apify Store as of 2026-04-17._

---

## Pick by Input Type

| Input you have                                                                 | Recommended actor                                   |
| ------------------------------------------------------------------------------ | --------------------------------------------------- |
| Profile handles / URLs                                                         | `apidojo/twitter-scraper-lite` or `kaitoeasyapi`    |
| Keyword / advanced search (`from:`, `since:`, `until:`, `lang:`, `min_faves:`) | `apidojo/tweet-scraper` V2 (richest filter support) |
| Tweet URLs → full thread / replies                                             | `apidojo/twitter-scraper-lite`                      |
| Twitter List URLs                                                              | `apidojo/twitter-list-scraper`                      |
| Profile metadata only (no tweets)                                              | `epctex/twitter-profile-scraper`                    |
| Follower / following lists                                                     | `apidojo/twitter-user-scraper` (with login cookies) |

---

## 1. Twitter Scraper Unlimited (Default Pick)

**Actor ID:** `apidojo/twitter-scraper-lite`
**API path:** `https://api.apify.com/v2/acts/apidojo~twitter-scraper-lite/runs`

### Input

| Field                | Type    | Description                                                                 |
| -------------------- | ------- | --------------------------------------------------------------------------- |
| `startUrls`          | array   | Profile URLs, tweet URLs, list URLs, or search URLs on x.com                |
| `searchTerms`        | array   | Keyword or advanced search queries (supports all X search operators)        |
| `maxItems`           | integer | Hard cap on total output items — **always set this to avoid runaway costs** |
| `addUserInfo`        | boolean | Include full author profile block on each tweet                             |
| `proxyConfiguration` | object  | Proxy settings (managed internally by default)                              |
| `customMapFunction`  | string  | Optional JS function to transform each output row                           |

```json
{
  "startUrls": [
    { "url": "https://x.com/NASA" },
    { "url": "https://x.com/search?q=space+telescope&src=typed_query" }
  ],
  "maxItems": 500,
  "addUserInfo": true
}
```

### Output

| Field                   | Type    | Description                                  |
| ----------------------- | ------- | -------------------------------------------- |
| `id`                    | string  | Tweet ID                                     |
| `text`                  | string  | Full tweet text                              |
| `url`                   | string  | Direct tweet URL                             |
| `createdAt`             | string  | ISO 8601 publish timestamp                   |
| `likeCount`             | integer | Number of likes                              |
| `retweetCount`          | integer | Number of retweets                           |
| `replyCount`            | integer | Number of replies                            |
| `quoteCount`            | integer | Number of quote tweets                       |
| `viewCount`             | integer | Impression/view count                        |
| `bookmarkCount`         | integer | Number of bookmarks                          |
| `lang`                  | string  | Detected language code                       |
| `hashtags`              | array   | Hashtags extracted from tweet                |
| `mentions`              | array   | @mentions in tweet                           |
| `urls`                  | array   | External URLs included in tweet              |
| `media`                 | array   | Image/video objects with URLs and dimensions |
| `isRetweet`             | boolean | Whether the tweet is a retweet               |
| `isReply`               | boolean | Whether the tweet is a reply                 |
| `conversationId`        | string  | ID of the thread root tweet                  |
| `author.userName`       | string  | Author's X handle                            |
| `author.name`           | string  | Author's display name                        |
| `author.id`             | string  | Author's numeric user ID                     |
| `author.isVerified`     | boolean | Blue/gold verification status                |
| `author.followersCount` | integer | Author's follower count                      |
| `author.followingCount` | integer | Author's following count                     |
| `author.profilePicUrl`  | string  | Author's profile image URL                   |
| `author.bio`            | string  | Author's bio text                            |

**Description:** The most versatile Twitter actor — accepts profiles, search queries, tweet URLs, list URLs, and conversations in a single input. Use it for mixed pipelines or when you need full thread extraction. Event-based pricing means no minimum tweet count required. ~18K total users on Apify Store.

---

## 2. Tweet Scraper V2

**Actor ID:** `apidojo/tweet-scraper`
**API path:** `https://api.apify.com/v2/acts/apidojo~tweet-scraper/runs`

### Input

| Field                | Type    | Description                                                   |
| -------------------- | ------- | ------------------------------------------------------------- |
| `searchTerms`        | array   | Search queries using X's advanced operators                   |
| `twitterHandles`     | array   | Usernames to scrape timeline tweets from                      |
| `tweetUrls`          | array   | Individual tweet URLs (for single-tweet or thread lookup)     |
| `maxItems`           | integer | Max tweets to retrieve — **minimum 50 per query recommended** |
| `sort`               | string  | `Latest` (chronological) or `Top` (most engaged)              |
| `since`              | string  | Start date filter — YYYY-MM-DD                                |
| `until`              | string  | End date filter — YYYY-MM-DD                                  |
| `tweetLanguage`      | string  | Language code filter (e.g. `en`, `th`, `ja`)                  |
| `onlyImage`          | boolean | Return only tweets with images                                |
| `onlyVideo`          | boolean | Return only tweets with videos                                |
| `onlyVerifiedUsers`  | boolean | Return only tweets from verified accounts                     |
| `minimumRetweets`    | integer | Min retweet count filter                                      |
| `minimumFavorites`   | integer | Min like count filter                                         |
| `minimumReplies`     | integer | Min reply count filter                                        |
| `includeSearchTerms` | boolean | Add matched search term to each output row                    |
| `proxyConfiguration` | object  | Proxy settings                                                |

```json
{
  "searchTerms": [
    "from:NASA since:2025-01-01",
    "#SpaceTelescope lang:en min_faves:100"
  ],
  "maxItems": 2000,
  "sort": "Latest",
  "since": "2025-01-01",
  "until": "2025-06-01"
}
```

### Output

| Field                   | Type    | Description                                               |
| ----------------------- | ------- | --------------------------------------------------------- |
| `id`                    | string  | Tweet ID                                                  |
| `text`                  | string  | Full tweet text                                           |
| `url`                   | string  | Direct tweet URL                                          |
| `createdAt`             | string  | ISO 8601 publish timestamp                                |
| `likeCount`             | integer | Like count                                                |
| `retweetCount`          | integer | Retweet count                                             |
| `replyCount`            | integer | Reply count                                               |
| `quoteCount`            | integer | Quote tweet count                                         |
| `viewCount`             | integer | View/impression count                                     |
| `lang`                  | string  | Language code                                             |
| `hashtags`              | array   | Hashtags in tweet                                         |
| `media`                 | array   | Attached image/video objects                              |
| `isRetweet`             | boolean | Is a retweet                                              |
| `isReply`               | boolean | Is a reply                                                |
| `matchedSearchTerm`     | string  | Which search term matched (if `includeSearchTerms: true`) |
| `author.userName`       | string  | Author handle                                             |
| `author.followersCount` | integer | Author follower count                                     |
| `author.isVerified`     | boolean | Verification status                                       |

**Description:** Optimized for large-scale keyword and advanced-search extractions. Supports all X search operators and runs at 30–80 tweets per second. Best for historical dataset builds, trend analysis, and brand monitoring. Minimum of ~50 tweets per query recommended for cost efficiency. Pricing: ~$0.40 / 1,000 tweets.

---

## 3. Cheapest Tweet Scraper

**Actor ID:** `kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest`
**API path:** `https://api.apify.com/v2/acts/kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest/runs`

### Input

| Field                | Type    | Description                              |
| -------------------- | ------- | ---------------------------------------- |
| `searchTerms`        | array   | Keyword or operator-based search queries |
| `twitterHandles`     | array   | Usernames to pull timeline tweets from   |
| `maxItems`           | integer | Max tweets to return                     |
| `sort`               | string  | `Latest` or `Top`                        |
| `since`              | string  | Start date — YYYY-MM-DD                  |
| `until`              | string  | End date — YYYY-MM-DD                    |
| `lang`               | string  | Language filter (e.g. `en`)              |
| `proxyConfiguration` | object  | Proxy settings                           |

```json
{
  "searchTerms": ["ChatGPT lang:en"],
  "maxItems": 5000,
  "sort": "Latest",
  "since": "2025-03-01"
}
```

### Output

| Field                   | Type    | Description         |
| ----------------------- | ------- | ------------------- |
| `id`                    | string  | Tweet ID            |
| `text`                  | string  | Full tweet text     |
| `url`                   | string  | Tweet URL           |
| `createdAt`             | string  | ISO 8601 timestamp  |
| `likeCount`             | integer | Like count          |
| `retweetCount`          | integer | Retweet count       |
| `replyCount`            | integer | Reply count         |
| `viewCount`             | integer | View count          |
| `lang`                  | string  | Language code       |
| `hashtags`              | array   | Hashtags in tweet   |
| `media`                 | array   | Media attachments   |
| `author.userName`       | string  | Author handle       |
| `author.followersCount` | integer | Follower count      |
| `author.isVerified`     | boolean | Verification status |

**Description:** The cheapest per-tweet actor on the Apify Store at $0.25 / 1,000 tweets. Fewer advanced filter options than Tweet Scraper V2 but covers the most common use cases: keyword pulls, timeline scraping, date ranges, and language filters. Best for high-volume budget-conscious extractions. Pricing: ~$0.25 / 1,000 tweets.

---

## 4. Twitter User Scraper

**Actor ID:** `apidojo/twitter-user-scraper`
**API path:** `https://api.apify.com/v2/acts/apidojo~twitter-user-scraper/runs`

### Input

| Field                | Type    | Description                                                         |
| -------------------- | ------- | ------------------------------------------------------------------- |
| `startUrls`          | array   | Profile URLs or tweet URLs on x.com                                 |
| `maxItems`           | integer | Max items to return per profile                                     |
| `getFollowers`       | boolean | Scrape the profile's follower list                                  |
| `getFollowing`       | boolean | Scrape the profile's following list                                 |
| `getRetweeters`      | boolean | Scrape users who retweeted a given tweet (requires tweet URL input) |
| `includeUnavailable` | boolean | Include suspended or unavailable accounts in output                 |
| `proxyConfiguration` | object  | Proxy settings                                                      |

```json
{
  "startUrls": [
    { "url": "https://x.com/NASA" },
    { "url": "https://x.com/elonmusk" }
  ],
  "maxItems": 1000,
  "getFollowers": true,
  "getFollowing": false
}
```

### Output

| Field            | Type    | Description                    |
| ---------------- | ------- | ------------------------------ |
| `userName`       | string  | X handle                       |
| `name`           | string  | Display name                   |
| `id`             | string  | Numeric user ID                |
| `bio`            | string  | Profile bio text               |
| `location`       | string  | User-provided location         |
| `website`        | string  | External website URL in bio    |
| `joinDate`       | string  | Account creation date          |
| `followersCount` | integer | Number of followers            |
| `followingCount` | integer | Number of accounts followed    |
| `tweetsCount`    | integer | Total tweet count              |
| `isVerified`     | boolean | Blue/gold verification status  |
| `isProtected`    | boolean | Whether the account is private |
| `profilePicUrl`  | string  | Profile image URL              |
| `bannerUrl`      | string  | Header/banner image URL        |
| `pinnedTweetId`  | string  | ID of pinned tweet (if any)    |

**Description:** Extracts detailed public profile data and optionally scrapes follower lists, following lists, and retweeters of specific tweets. Note that follower/following lists may require session cookies for large accounts. Pay-per-event pricing.

---

## 5. Twitter List Scraper

**Actor ID:** `apidojo/twitter-list-scraper`
**API path:** `https://api.apify.com/v2/acts/apidojo~twitter-list-scraper/runs`

### Input

| Field                | Type    | Description                                                    |
| -------------------- | ------- | -------------------------------------------------------------- |
| `listUrls`           | array   | X (Twitter) list URLs (e.g. `https://x.com/i/lists/123456789`) |
| `listIds`            | array   | Numeric list IDs (alternative to URLs)                         |
| `maxItems`           | integer | Max tweets to extract per list                                 |
| `getMembers`         | boolean | Extract list member profiles instead of tweets                 |
| `proxyConfiguration` | object  | Proxy settings                                                 |

```json
{
  "listUrls": [{ "url": "https://x.com/i/lists/123456789" }],
  "maxItems": 500,
  "getMembers": false
}
```

### Output — Tweets mode

| Field                   | Type    | Description           |
| ----------------------- | ------- | --------------------- |
| `id`                    | string  | Tweet ID              |
| `text`                  | string  | Tweet text            |
| `url`                   | string  | Tweet URL             |
| `createdAt`             | string  | ISO 8601 timestamp    |
| `likeCount`             | integer | Like count            |
| `retweetCount`          | integer | Retweet count         |
| `replyCount`            | integer | Reply count           |
| `quoteCount`            | integer | Quote count           |
| `bookmarkCount`         | integer | Bookmark count        |
| `media`                 | array   | Attached media URLs   |
| `author.userName`       | string  | Author handle         |
| `author.followersCount` | integer | Author follower count |
| `author.isVerified`     | boolean | Verification status   |

### Output — Members mode

| Field            | Type    | Description         |
| ---------------- | ------- | ------------------- |
| `userName`       | string  | Member handle       |
| `name`           | string  | Member display name |
| `bio`            | string  | Member bio          |
| `followersCount` | integer | Follower count      |
| `isVerified`     | boolean | Verification status |
| `location`       | string  | Location            |

**Description:** Extracts tweets or member profiles from any public X List. No authentication required. Runs at up to 80 tweets/second. Ideal for monitoring curated industry lists, competitor intelligence, and influencer list building. Pricing: $0.008 per list + $0.0004 per tweet (~$4.00 per 10,000 tweets).

---

## 6. Twitter Profile Scraper

**Actor ID:** `epctex/twitter-profile-scraper`
**API path:** `https://api.apify.com/v2/acts/epctex~twitter-profile-scraper/runs`

### Input

| Field                | Type    | Description                                    |
| -------------------- | ------- | ---------------------------------------------- |
| `startUrls`          | array   | Profile URLs on x.com                          |
| `maxTweets`          | integer | Max tweets to retrieve per profile             |
| `getReplies`         | boolean | Include replies in tweet output                |
| `minReplyCount`      | integer | Min reply count threshold for fetching replies |
| `proxyConfiguration` | object  | Proxy settings                                 |

```json
{
  "startUrls": [{ "url": "https://x.com/NASA" }],
  "maxTweets": 200,
  "getReplies": true,
  "minReplyCount": 5
}
```

### Output

| Field                   | Type    | Description                                   |
| ----------------------- | ------- | --------------------------------------------- |
| `id`                    | string  | Tweet ID                                      |
| `text`                  | string  | Tweet text                                    |
| `url`                   | string  | Tweet URL                                     |
| `createdAt`             | string  | ISO 8601 timestamp                            |
| `likeCount`             | integer | Like count                                    |
| `retweetCount`          | integer | Retweet count                                 |
| `replyCount`            | integer | Reply count                                   |
| `viewCount`             | integer | View count                                    |
| `author.userName`       | string  | Author handle                                 |
| `author.name`           | string  | Display name                                  |
| `author.bio`            | string  | Bio text                                      |
| `author.followersCount` | integer | Follower count                                |
| `author.followingCount` | integer | Following count                               |
| `author.tweetsCount`    | integer | Total tweet count                             |
| `author.joinDate`       | string  | Account join date                             |
| `author.location`       | string  | Location                                      |
| `author.website`        | string  | Website URL                                   |
| `author.isVerified`     | boolean | Verification status                           |
| `replies`               | array   | Reply tweet objects (when `getReplies: true`) |

**Description:** Profile-focused scraper with a stable schema and optional reply threading. Rental model ($10/mo) gives consistent performance without per-tweet pricing surprises. Best for ongoing profile monitoring pipelines where schema stability matters more than cost per tweet. Pricing: $10/month rental + usage.

---

## Advanced Search Operators

All actors that accept `searchTerms` support X's full query syntax:

| Operator           | Example             | Description                 |
| ------------------ | ------------------- | --------------------------- |
| `from:`            | `from:NASA`         | Tweets from a specific user |
| `to:`              | `to:NASA`           | Tweets replying to a user   |
| `since:`           | `since:2025-01-01`  | Tweets after a date         |
| `until:`           | `until:2025-06-30`  | Tweets before a date        |
| `lang:`            | `lang:en`           | Filter by language          |
| `min_faves:`       | `min_faves:100`     | Minimum like count          |
| `min_retweets:`    | `min_retweets:50`   | Minimum retweet count       |
| `min_replies:`     | `min_replies:10`    | Minimum reply count         |
| `filter:media`     | `NASA filter:media` | Only tweets with media      |
| `filter:images`    | `filter:images`     | Only tweets with images     |
| `filter:videos`    | `filter:videos`     | Only tweets with videos     |
| `filter:verified`  | `filter:verified`   | Only from verified accounts |
| `-filter:retweets` | `-filter:retweets`  | Exclude retweets            |
| `#`                | `#SpaceTelescope`   | Hashtag search              |
| `"exact phrase"`   | `"mars rover"`      | Exact phrase match          |
| `OR`               | `NASA OR SpaceX`    | Either term                 |

---

## Universal Notes

- **No login required** for tweets, profiles, and search. Session cookies may be needed for follower/following lists on large accounts.
- **Always set `maxItems`** — leaving it empty on a broad keyword query is the most common way to burn through credits unexpectedly.
- **Minimum tweet count:** Tweet Scraper V2 is optimized for batches of 50+ tweets. For single tweets or small thread pulls, use Twitter Scraper Unlimited (event-based) instead.
- **Scheduling:** All actors support Apify Schedules and webhook triggers for automated periodic runs.
- **Integrations:** Connect output to Google Drive, Airtable, Slack, Make, n8n, or Zapier via the Apify API.
- **Free tier:** Apify provides $5.00 in free monthly credits for testing.
- **Rate limiting:** X aggressively blocks logged-out browsing. The pay-per-result actors handle rotating sessions internally — you do not need to supply your own proxies or cookies for standard tweet/search/profile scraping.

## X API vs Apify Scrapers

| Dimension           | X API Basic (~$200/mo)      | Apify Scrapers                           |
| ------------------- | --------------------------- | ---------------------------------------- |
| Monthly minimum     | ~$200/mo with read caps     | None — pay per tweet                     |
| Cost at 100k tweets | Hits caps quickly           | ~$25 (kaitoeasyapi) to ~$40 (apidojo V2) |
| Search operators    | Full filtered-stream        | Most X web operators supported           |
| Login-gated content | Official app auth           | Some actors accept session cookies       |
| Maintenance         | Stable HTTP contract        | Publisher fixes when X breaks markup     |
| Setup               | Requires app review + OAuth | No review, no API key                    |
