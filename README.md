# Shortly --- URL Shortener with Analytics

A full-stack URL shortener inspired by services like Bitly.

Shorten a long URL, get a compact short link, track every click, and
view analytics including total clicks, daily clicks, and referrers.

## 🚀 Live Demo

**Frontend:**\
https://shortly-bay-kappa.vercel.app

**Backend API:**\
https://shortly-kaa1.onrender.com

> The backend is hosted on Render's free tier, so the first request
> after a period of inactivity may take 30--60 seconds due to a cold
> start.

------------------------------------------------------------------------

## ✨ Features

-   🔗 Create short URLs
-   ↪️ Redirect short URLs to the original destination
-   📊 Track total clicks
-   📅 View clicks per day
-   🌐 Track referrers
-   🔐 PostgreSQL database
-   🛡️ Parameterized SQL queries for SQL injection protection
-   ✅ HTTP/HTTPS URL validation
-   🎲 Collision-resistant random short codes
-   🌍 Production frontend and backend deployment
-   📱 Responsive React frontend

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

### Database & Deployment

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)

### Tools

![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

------------------------------------------------------------------------

## 🏗️ Architecture

``` text
                    ┌──────────────────────┐
                    │      React + Vite    │
                    │       Frontend       │
                    │       Vercel         │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │    Node.js + Express │
                    │       Backend        │
                    │        Render        │
                    └──────────┬───────────┘
                               │
                               │ SQL
                               ▼
                    ┌──────────────────────┐
                    │      PostgreSQL      │
                    │        Neon          │
                    └──────────────────────┘
```

------------------------------------------------------------------------

## 🔌 API Endpoints

  -------------------------------------------------------------------------------------
  Method         Route                     Description    Success        Errors
  -------------- ------------------------- -------------- -------------- --------------
  `POST`         `/api/shorten`            Create a short `201`          `400`, `500`
                                           URL                           

  `GET`          `/:shortCode`             Redirect and   `302`          `404`, `500`
                                           record click                  

  `GET`          `/api/stats/:shortCode`   Return click   `200`          `404`, `500`
                                           analytics                     
  -------------------------------------------------------------------------------------

------------------------------------------------------------------------

## POST `/api/shorten`

Creates a new short URL.

### Request

``` json
{
  "url": "https://google.com"
}
```

### Response --- `201 Created`

``` json
{
  "shortCode": "8Pc5Gmc",
  "shortUrl": "https://shortly-kaa1.onrender.com/8Pc5Gmc"
}
```

### Invalid Input --- `400 Bad Request`

``` json
{
  "message": "Invalid URL"
}
```

Only `http://` and `https://` URLs are accepted.

------------------------------------------------------------------------

## GET `/:shortCode`

Redirects the visitor to the original URL.

Example:

``` text
GET https://shortly-kaa1.onrender.com/8Pc5Gmc
```

Returns:

``` text
302 Found
Location: https://google.com
```

Every successful redirect records a click in the database.

The request's `Referer` header is also stored when available.

Unknown short codes return:

``` json
{
  "message": "Short URL not found"
}
```

with status `404`.

------------------------------------------------------------------------

## GET `/api/stats/:shortCode`

Returns analytics for a short URL.

### Response --- `200 OK`

``` json
{
  "shortCode": "8Pc5Gmc",
  "totalClicks": 4,
  "clicksPerDay": [
    {
      "date": "2026-09-30",
      "clicks": 4
    }
  ],
  "referrers": [
    {
      "referrer": null,
      "clicks": 4
    }
  ]
}
```

A `null` referrer means the short link was opened directly without a
referring website.

All dates are grouped in UTC.

------------------------------------------------------------------------

## 🗄️ Database Schema

``` sql
CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clicks (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  referrer TEXT,
  FOREIGN KEY (url_id)
    REFERENCES urls(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_clicks_url_id
ON clicks(url_id);
```

### Why these choices?

#### Unique short codes

`short_code` is marked `UNIQUE`.

PostgreSQL enforces uniqueness at the database level and automatically
creates an index for the unique constraint, making:

``` sql
WHERE short_code = $1
```

efficient.

#### Click index

The `idx_clicks_url_id` index improves analytics queries because stats
queries filter clicks using `url_id`.

#### Foreign key

`clicks.url_id` references `urls.id` with:

``` sql
ON DELETE CASCADE
```

This prevents orphaned click records when a URL is deleted.

------------------------------------------------------------------------

## 🧠 Design Decisions

### Collision-resistant short codes

Short codes are generated using Node.js `crypto`:

-   5 random bytes
-   Base64url encoding
-   First 7 characters are used
-   Approximately `64^7 ≈ 4.4 trillion` possible combinations

Uniqueness is enforced by PostgreSQL rather than by a separate `SELECT`
check.

If PostgreSQL returns unique-violation error `23505`, the application
generates another code and retries the insert, up to 5 attempts.

This avoids the race condition that can occur with:

``` text
SELECT → check → INSERT
```

under concurrent requests.

------------------------------------------------------------------------

### SQL Injection Protection

All database queries use PostgreSQL parameterized queries:

``` sql
WHERE short_code = $1
```

User input is never directly concatenated into SQL statements.

------------------------------------------------------------------------

### Input Validation

URLs are parsed using JavaScript's `URL` constructor.

Only these protocols are accepted:

``` text
http:
https:
```

Invalid URLs return:

``` text
400 Bad Request
```

------------------------------------------------------------------------

### Timezone-safe Analytics

Daily click grouping is performed in SQL using:

``` sql
TO_CHAR(clicked_at, 'YYYY-MM-DD')
```

This avoids JavaScript `Date` conversions that can shift dates depending
on the user's local timezone.

------------------------------------------------------------------------

### Environment-based Configuration

Configuration is loaded from environment variables:

``` env
DATABASE_URL=your_postgres_connection_string
BASE_URL=http://localhost:3000
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Production secrets are not committed to Git.

`.env` is included in `.gitignore`.

------------------------------------------------------------------------

### 302 Redirects

The application uses a temporary `302 Found` redirect instead of a
permanent `301`.

This helps ensure that requests continue reaching the server so clicks
can be recorded rather than relying on a permanently cached browser
redirect.

------------------------------------------------------------------------

## 📁 Project Structure

``` text
shortlee/
│
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   └── urlController.js
│   │
│   └── routes/
│       └── urlRoutes.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── api/
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── Shortly.postman_collection.json
├── package.json
├── package-lock.json
└── README.md
```

------------------------------------------------------------------------

## 💻 Run Locally

### 1. Clone the repository

``` bash
git clone https://github.com/100rabheimer/shortly.git
cd shortly
```

### 2. Install backend dependencies

``` bash
npm install
```

### 3. Install frontend dependencies

``` bash
cd frontend
npm install
cd ..
```

### 4. Create backend `.env`

``` env
DATABASE_URL=your_postgres_connection_string
BASE_URL=http://localhost:3000
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 5. Create frontend `.env`

Inside `frontend/.env`:

``` env
VITE_API_URL=http://localhost:3000
```

### 6. Set up the database

Run the SQL from the **Database Schema** section in your PostgreSQL
database.

### 7. Start the backend

From the project root:

``` bash
npm run dev
```

Backend:

``` text
http://localhost:3000
```

### 8. Start the frontend

In another terminal:

``` bash
cd frontend
npm run dev
```

Frontend:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

## 🧪 Testing with Postman

Import:

``` text
Shortly.postman_collection.json
```

The collection covers five test cases:

  Request                                 Expected Status
  ------------------------------------- -----------------
  `POST /api/shorten` --- valid URL                 `201`
  `POST /api/shorten` --- invalid URL               `400`
  `GET /:shortCode` --- existing code               `302`
  `GET /:shortCode` --- unknown code                `404`
  `GET /api/stats/:shortCode`                       `200`

For redirect testing, disable **Automatically follow redirects** in
Postman so the `302` response and `Location` header can be inspected.

------------------------------------------------------------------------

## 🚀 Deployment

### Frontend

The React/Vite frontend is deployed on **Vercel**.

Production API configuration:

``` env
VITE_API_URL=https://shortly-kaa1.onrender.com
```

### Backend

The Node.js/Express API is deployed on **Render**.

Production configuration includes:

``` env
BASE_URL=https://shortly-kaa1.onrender.com
FRONTEND_URL=https://shortly-bay-kappa.vercel.app
```

### Database

PostgreSQL is hosted using **Neon**.

------------------------------------------------------------------------
## 🔮 Future Improvements

-   Log clicks asynchronously without blocking redirects
-   Validate that `url` is a string before parsing
-   Add rate limiting
-   Add custom aliases
-   Add URL deletion
-   Add authentication and user-specific links
-   Add QR code generation
-   Add richer analytics and charts

------------------------------------------------------------------------

## 👨‍💻 Author

**Saurabh Pandey**

GitHub:\
https://github.com/100rabheimer
