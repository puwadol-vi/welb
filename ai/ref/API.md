# WelB API Documentation

Base URL: `https://demo.wel-b.net/`

---

## Authentication

All endpoints require the same header:

| Header          | Required | Description                                                                              |
| --------------- | -------- | ---------------------------------------------------------------------------------------- |
| `Authorization` | Yes      | `Bearer <SCRAPER_API_KEY>`. Use the value of the `SCRAPER_API_KEY` environment variable. |

Missing or invalid token returns `401 Unauthorized` with body `{ "error": "Unauthorized" }`.
