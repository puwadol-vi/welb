### GET /api/event/events/:id

Fetch a single event by ID. Used to verify a created event.

**Headers:** `Authorization: Bearer <SCRAPER_API_KEY>` (required).

**Path parameters:**

| Param | Type   | Description    |
| ----- | ------ | -------------- |
| `id`  | string | UUID of event. |

**Responses:**

| Status | Body                                                     |
| ------ | -------------------------------------------------------- |
| 200    | `{ "event": { ...EventRow } }`                           |
| 401    | `{ "error": "Unauthorized" }`                            |
| 404    | `{ "error": "Event not found" }`                         |
| 500    | `{ "error": "Internal server error", "details": "..." }` |

**Example:**

```
GET /api/event/events/abc123-...
Authorization: Bearer <key>
```

```json
{
  "event": {
    "id": "abc123-...",
    "title": "Bitcoin Meetup Bangkok",
    "start_date": "2025-06-01T14:00:00",
    "is_active": false,
    ...
  }
}
```
