### GET /api/spot/spots

Search existing spots by name. Used to find and link a spot to an event.

**Headers:** `Authorization: Bearer <SCRAPER_API_KEY>` (required).

**Query parameters:**

| Param    | Type   | Required | Description                             |
| -------- | ------ | -------- | --------------------------------------- |
| `search` | string | yes      | Case-insensitive partial match on name. |

Returns up to 20 results ordered by name.

**Response fields (per spot):**

`id`, `name`, `province`, `region`, `type`, `category`, `is_active`, `is_verified`

**Responses:**

| Status | Body                                                     |
| ------ | -------------------------------------------------------- |
| 200    | `{ "spots": [ { ...SpotRow } ], "count": number }`       |
| 400    | `{ "error": "search query param is required" }`          |
| 401    | `{ "error": "Unauthorized" }`                            |
| 500    | `{ "error": "Internal server error", "details": "..." }` |

**Example:**

```
GET /api/spot/spots?search=Bitcoin
Authorization: Bearer <key>
```

```json
{
  "spots": [
    {
      "id": 7,
      "name": "Bitcoin Coffee Bangkok",
      "province": "Bangkok",
      "region": "Central",
      "type": "shop",
      "category": "cafe",
      "is_active": true,
      "is_verified": true
    }
  ],
  "count": 1
}
```
