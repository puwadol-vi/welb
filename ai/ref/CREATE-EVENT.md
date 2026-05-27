### GET /api/create-event

Health check for the event create API.

**Headers:** `Authorization: Bearer <SCRAPER_API_KEY>` (required).

**Request body:** None.

**Responses:**

| Status | Body                                                         |
| ------ | ------------------------------------------------------------ |
| 200    | `{ "status": "ok", "message": "Event create API is ready" }` |
| 401    | `{ "error": "Unauthorized" }`                                |

---

### POST /api/create-event

Create a new event (used by scraper). The created event is inserted as inactive.

**Headers:** `Authorization: Bearer <SCRAPER_API_KEY>` (required).

**Request body:** JSON.

#### Required

| Field       | Type   | Description                                                           |
| ----------- | ------ | --------------------------------------------------------------------- |
| `title`     | string | Event title. Cannot be null or empty.                                 |
| `startDate` | string | Start date/time, ISO 8601 (e.g. `2025-03-10T14:00:00` or ISO string). |

#### Optional

| Field             | Type           | Default    | Description                   |
| ----------------- | -------------- | ---------- | ----------------------------- |
| `description`     | string \| null | `null`     | Event description.            |
| `type`            | string         | `"meetup"` | Event type.                   |
| `price`           | number \| null | `null`     | Price.                        |
| `currency`        | string \| null | `null`     | Currency code.                |
| `endDate`         | string \| null | `null`     | End date/time, ISO 8601.      |
| `location`        | string         | `""`       | Location text.                |
| `organizerName`   | string         | `""`       | Organizer name.               |
| `imageUrl`        | string \| null | `null`     | Image URL.                    |
| `eventUrl`        | string \| null | `null`     | Event page URL.               |
| `registrationUrl` | string \| null | `null`     | Registration URL.             |
| `isWelBProject`   | boolean        | `false`    | Whether it is a WelB project. |
| `isMarket`        | boolean        | `false`    | Whether it is a market event. |

**Responses:**

| Status | Body                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------- |
| 200    | `{ "success": true, "action": "created", "event": { ... }, "message": "New event created (inactive)" }` |
| 400    | `{ "error": "Missing required field: <field>" }`                                                        |
| 401    | `{ "error": "Unauthorized" }`                                                                           |
| 500    | `{ "error": "Internal server error", "details": "..." }`                                                |
