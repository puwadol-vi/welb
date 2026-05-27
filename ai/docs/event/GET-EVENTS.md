### GET /api/event/events

Search events by title and/or startDate. Used for duplicate checking before creating a new event.

**Headers:** `Authorization: Bearer <SCRAPER_API_KEY>` (required).

**Query parameters:**

| Param       | Type   | Required | Description                                                                                         |
| ----------- | ------ | -------- | --------------------------------------------------------------------------------------------------- |
| `title`     | string | optional | Case-insensitive partial match on event title.                                                      |
| `startDate` | string | optional | ISO 8601 date (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss`). Matches all events on the same calendar day. |

At least one of `title` or `startDate` must be provided.

**Responses:**

| Status | Body                                                            |
| ------ | --------------------------------------------------------------- |
| 200    | `{ "events": [ { ...EventRow } ], "count": number }`            |
| 400    | `{ "error": "At least one of title or startDate is required" }` |
| 401    | `{ "error": "Unauthorized" }`                                   |
| 500    | `{ "error": "Internal server error", "details": "..." }`        |

**Example:**

```
GET /api/event/events?title=Bitcoin&startDate=2025-06-01
Authorization: Bearer <key>
```

```json
{
  "events": [
    {
      "id": "abc123",
      "title": "Bitcoin Meetup Bangkok",
      "start_date": "2025-06-01T14:00:00",
      ...
    }
  ],
  "count": 1
}
```
