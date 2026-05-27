### POST /api/upload-image

Upload an image file to Supabase Storage and get back a permanent public URL.

**Headers:** `Authorization: Bearer <SCRAPER_API_KEY>` (required).

**Request body:** `multipart/form-data`

| Field   | Type | Required | Description           |
| ------- | ---- | -------- | --------------------- |
| `image` | File | yes      | Image file to upload. |

Supported formats: JPEG, PNG, WebP, GIF (any `image/*` content-type).

**Responses:**

| Status | Body                                                                     |
| ------ | ------------------------------------------------------------------------ |
| 200    | `{ "success": true, "url": "https://...", "fileName": "1234-abcd.jpg" }` |
| 400    | `{ "error": "Missing required field: image (multipart file)" }`          |
| 401    | `{ "error": "Unauthorized" }`                                            |
| 500    | `{ "error": "Internal server error", "details": "..." }`                 |

**Example (curl):**

```bash
curl -X POST https://welb.xyz/api/upload-image \
  -H "Authorization: Bearer <key>" \
  -F "image=@/path/to/photo.jpg"
```

```json
{
  "success": true,
  "url": "https://<project>.supabase.co/storage/v1/object/public/event-images/1748000000000-x7k2p.jpg",
  "fileName": "1748000000000-x7k2p.jpg"
}
```

Use the returned `url` as `imageUrl` when calling `POST /api/create-event` or `PATCH /api/events/:id`.
