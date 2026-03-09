### GET /api/create-spot

Health check for the spot create API.

**Headers:** `Authorization: Bearer <SCRAPER_API_KEY>` (required).

**Request body:** None.

**Responses:**

| Status | Body                                                        |
| ------ | ----------------------------------------------------------- |
| 200    | `{ "status": "ok", "message": "Spot update API is ready" }` |
| 401    | `{ "error": "Unauthorized" }`                               |

---

### POST /api/create-spot

Create a new spot (used by scraper). The created spot is inserted as unverified and inactive.

**Headers:** `Authorization: Bearer <SCRAPER_API_KEY>` (required).

**Request body:** JSON.

#### Required

| Field           | Type   | Description                           |
| --------------- | ------ | ------------------------------------- |
| `name`          | string | Spot name. Cannot be null or empty.   |
| `description`   | string | Spot description.                     |
| `type`          | string | Spot type (e.g. `"shop"`, `"event"`). |
| `category`      | string | Category.                             |
| `region`        | string | Region.                               |
| `province`      | string | Province.                             |
| `googleMapLink` | string | Google Maps URL.                      |

#### Optional

| Field          | Type           | Default | Description            |
| -------------- | -------------- | ------- | ---------------------- |
| `provinceTh`   | string \| null | `null`  | Province name in Thai. |
| `district`     | string \| null | `null`  | District.              |
| `districtTh`   | string \| null | `null`  | District name in Thai. |
| `address`      | string \| null | `null`  | Full address.          |
| `lat`          | string \| null | `null`  | Latitude.              |
| `lng`          | string \| null | `null`  | Longitude.             |
| `phone`        | string \| null | `null`  | Phone number.          |
| `facebookLink` | string \| null | `null`  | Facebook page URL.     |
| `websiteLink`  | string \| null | `null`  | Website URL.           |

**Responses:**

| Status | Body                                                                                                                          |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 200    | `{ "success": true, "action": "created", "spot": { ... }, "message": "New unverified spot created", "previousSpotId": null }` |
| 400    | `{ "error": "Missing required field: <field>" }`                                                                              |
| 401    | `{ "error": "Unauthorized" }`                                                                                                 |
| 500    | `{ "error": "Internal server error", "details": "..." }`                                                                      |
