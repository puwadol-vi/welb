### PATCH /api/event/events/:id

Soft-update an existing event. Instead of mutating the original record, this always **creates a new unverified event** that copies all fields from the old event and applies the provided changes. The old event is left untouched (`is_verified = true`, `is_active = true`, `ref_id = null`).

The new record has:
- `is_verified = false` (pending review)
- `is_active = true`
- `ref_id = <old event id>`

**Headers:** `Authorization: Bearer <SCRAPER_API_KEY>` (required).

**Path parameters:**

| Param | Type   | Description    |
| ----- | ------ | -------------- |
| `id`  | string | UUID of the existing event to soft-update. |

**Request body:** JSON — include only the fields you want to change. At least one field is required.

| Field              | Type           | Description                   |
| ------------------ | -------------- | ----------------------------- |
| `title`            | string         | Event title.                  |
| `description`      | string \| null | Event description.            |
| `type`             | string         | Event type.                   |
| `price`            | number \| null | Price.                        |
| `currency`         | string \| null | Currency code (e.g. `"THB"`). |
| `startDate`        | string         | ISO 8601 start date/time.     |
| `endDate`          | string \| null | ISO 8601 end date/time.       |
| `location`         | string         | Location text.                |
| `organizerName`    | string         | Organizer name.               |
| `imageUrl`         | string \| null | Image URL.                    |
| `eventUrl`         | string \| null | Event page URL.               |
| `registrationUrl`  | string \| null | Registration URL.             |
| `participantCount` | number \| null | Number of participants.       |
| `isWelBProject`    | boolean        | Whether it is a WelB project. |
| `isMarket`         | boolean        | Whether it is a market event. |

**Responses:**

| Status | Body                                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------- |
| 200    | `{ "success": true, "action": "soft-updated", "oldId": "...", "event": { ...new EventRow }, "message": "..." }` |
| 400    | `{ "error": "No updatable fields provided" }`                                                                 |
| 401    | `{ "error": "Unauthorized" }`                                                                                 |
| 404    | `{ "error": "Event not found" }`                                                                              |
| 500    | `{ "error": "Internal server error", "details": "..." }`                                                      |

**Example:**

```
PATCH /api/event/events/abc123-...
Authorization: Bearer <key>
Content-Type: application/json

{
  "imageUrl": "https://example.com/new-image.jpg",
  "description": "Updated description with new details."
}
```

Response:
```json
{
  "success": true,
  "action": "soft-updated",
  "oldId": "abc123-...",
  "event": { "id": "def456-...", "ref_id": "abc123-...", "is_verified": false, ... },
  "message": "New event version created (pending verification)"
}
```
