### PATCH /api/event/events/:id

Update one or more fields of an existing event. Only provided fields are changed.

**Headers:** `Authorization: Bearer <SCRAPER_API_KEY>` (required).

**Path parameters:**

| Param | Type   | Description    |
| ----- | ------ | -------------- |
| `id`  | string | UUID of event. |

**Request body:** JSON — include only the fields you want to update.

#### Event fields (same as create)

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

#### Admin fields

| Field       | Type           | Description                    |
| ----------- | -------------- | ------------------------------ |
| `spotId`    | number \| null | Link to an existing spot.      |
| `isActive`  | boolean        | Activate/deactivate the event. |
| `isVerified`| boolean        | Mark the event as verified.    |

**Responses:**

| Status | Body                                                                |
| ------ | ------------------------------------------------------------------- |
| 200    | `{ "success": true, "event": { ...EventRow } }`                     |
| 400    | `{ "error": "No updatable fields provided" }`                       |
| 401    | `{ "error": "Unauthorized" }`                                       |
| 404    | `{ "error": "Event not found or update failed", "details": "..." }` |
| 500    | `{ "error": "Internal server error", "details": "..." }`            |

**Example:**

```
PATCH /api/event/events/abc123-...
Authorization: Bearer <key>
Content-Type: application/json

{
  "spotId": 42,
  "imageUrl": "https://example.com/image.jpg",
  "participantCount": 150,
  "isActive": true,
  "isVerified": true
}
```
