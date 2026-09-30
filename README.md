# Shortly — URL Shortener API with Analytics (2026)

A REST API like bit.ly. POST a long URL, get a short code back. Visiting the short link redirects (302) and records the click. An analytics endpoint returns total clicks, clicks per day, and referrers.

**Live API:** https://shortly-kaa1.onrender.com

> Hosted on Render's free tier, so the first request after 15 minutes of inactivity can take 30-60 seconds (cold start).

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=black)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

## API Endpoints

| Method | Route | Description | Success | Errors |
|---|---|---|---|---|
| POST | `/api/shorten` | Create a short URL | `201` | `400` invalid/missing URL, `500` server error |
| GET | `/:shortCode` | Redirect to the original URL and log the click | `302` | `404` code not found |
| GET | `/api/stats/:shortCode` | Click analytics for a short code | `200` | `404` code not found |

### POST /api/shorten

Request:

```json
{ "url": "https://google.com" }
```

Response `201 Created`:

```json
{
  "shortCode": "8Pc5Gmc",
  "shortUrl": "https://shortly-kaa1.onrender.com/8Pc5Gmc"
}
```

Invalid input returns `400`:

```json
{ "message": "Invalid URL" }
```

### GET /:shortCode

Returns `302 Found` with a `Location` header pointing to the original URL. The click (with its `Referer` header) is stored in the `clicks` table. An unknown code returns `404`:

```json
{ "message": "Short URL not found" }
```

### GET /api/stats/:shortCode

Response `200 OK`:

```json
{
  "shortCode": "8Pc5Gmc",
  "totalClicks": 4,
  "clicksPerDay": [
    { "date": "2026-09-30", "clicks": 4 }
  ],
  "referrers": [
    { "referrer": null, "clicks": 4 }
  ]
}
```

A `null` referrer means the link was opened directly (typed in the browser, no referring site). All dates are in UTC.

## Database Schema

```sql
CREATE TABLE urls (
  id           SERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code   VARCHAR(10) NOT NULL UNIQUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clicks (
  id         SERIAL PRIMARY KEY,
  url_id     INTEGER NOT NULL,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  referrer   TEXT,
  FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE
);

CREATE INDEX idx_clicks_url_id ON clicks(url_id);
```

**Why these choices**

- `short_code` is `UNIQUE`. This gives a guarantee enforced by the database, and Postgres automatically creates an index for it, so redirect lookups (`WHERE short_code = $1`) are fast.
- `idx_clicks_url_id` speeds up every stats query, since they all filter with `WHERE url_id = $1`. Verified with `EXPLAIN (ANALYZE, BUFFERS)`.
- `clicks.url_id` is a foreign key with `ON DELETE CASCADE`, so deleting a URL also deletes its clicks and no orphan rows remain.

## Design Decisions

**Collision-free short codes.** A code is 7 characters of base64url, generated from 5 random bytes using Node's `crypto` module (64^7 ≈ 4.4 trillion combinations). Uniqueness is guaranteed by the database, not by application code: the insert is attempted directly, and if Postgres raises a unique violation (error `23505`), a new code is generated and the insert retried, up to 5 times. Checking with SELECT first and then INSERT would create a race condition between concurrent requests.

**SQL injection safety.** Every query is parameterised (`$1`, `$2`). User input is never concatenated into SQL.

**Input validation.** The URL is parsed with `new URL()` and only `http:` and `https:` protocols are accepted. Anything else returns `400` with a clear message.

**Timezone-safe analytics.** Per-day grouping is done in SQL with `TO_CHAR(clicked_at, 'YYYY-MM-DD')`. This avoids JavaScript `Date` conversions, which shifted dates by one day for users in timezones ahead of UTC.

**Configuration through environment variables.** `DATABASE_URL`, `BASE_URL` and `PORT` are read from the environment. No secrets are in the repository, and `.env` is git-ignored.

**302 instead of 301.** A temporary redirect means browsers do not cache it permanently, so every visit reaches the server and gets counted as a click.

## Project Structure

```
src/
├── app.js                     # Express app, middleware, routes
├── server.js                  # Starts the server
├── config/db.js               # pg connection pool
├── controllers/urlController.js
└── routes/urlRoutes.js
Shortly.postman_collection.json   # Postman collection with all 5 test requests
```

## Run Locally

```bash
git clone https://github.com/100rabheimer/shortly.git
cd shortly
npm install
```

Create a `.env` file:

```
DATABASE_URL=your_postgres_connection_string
BASE_URL=http://localhost:3000
```

Run the SQL from the schema section above in your Postgres database, then:

```bash
npm run dev    # development (nodemon)
npm start      # production
```

## Testing

Import `Shortly.postman_collection.json` into Postman. It covers all five cases:

| Request | Expected status |
|---|---|
| POST /api/shorten (valid URL) | 201 |
| POST /api/shorten (invalid URL) | 400 |
| GET /:shortCode (exists) | 302 |
| GET /:shortCode (does not exist) | 404 |
| GET /api/stats/:shortCode | 200 |

For the redirect request, turn off "Automatically follow redirects" in Postman settings to see the 302.

## Future Improvements

- Move redirect logic from `app.js` into the controller
- Log clicks without blocking the redirect
- Limit URL length and validate that `url` is a string
- Global error handler and 404 handler
- Show `"direct"` instead of `null` for empty referrers
- Use `TIMESTAMPTZ` instead of `TIMESTAMP`
- Rate limiting and custom aliases

## Author

Saurabh Pandey · [GitHub](https://github.com/100rabheimer)
