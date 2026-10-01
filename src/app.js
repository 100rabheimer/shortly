const express = require("express");
const cors = require("cors");

// PostgreSQL connection pool
const pool = require("./config/db");

// URL related API routes
const routes = require("./routes/urlRoutes");

const app = express();

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// JSON request body ko parse karne ke liye
app.use(express.json());


// --------------------------------------------------
// 1. Health Check + Database Connection Test
// --------------------------------------------------

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Shortlee API is running 🚀",
      databaseTime: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});


// --------------------------------------------------
// 2. Short URL Redirect + Click Tracking
// --------------------------------------------------

app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, original_url FROM urls WHERE short_code = $1",
      [shortCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Short URL not found",
      });
    }

    const originalUrl = result.rows[0].original_url;
    const urlId = result.rows[0].id;

    await pool.query(
      "INSERT INTO clicks (url_id, referrer) VALUES ($1, $2)",
      [urlId, req.get("referer") || null]
    );

    res.redirect(302, originalUrl);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// --------------------------------------------------
// 3. URL API Routes
// --------------------------------------------------

app.use("/api", routes);


// Export app
module.exports = app;