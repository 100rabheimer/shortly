const express = require("express");

// PostgreSQL connection pool
const pool = require("./config/db");

// URL related API routes
const routes = require("./routes/urlRoutes");

const app = express();

// JSON request body ko parse karne ke liye
// Example: { "url": "https://google.com" }
app.use(express.json());


// --------------------------------------------------
// 1. Health Check + Database Connection Test
// --------------------------------------------------

app.get("/", async (req, res) => {
  try {
    // Database se current time fetch kar rahe hain
    // Isse confirm hota hai ki PostgreSQL properly connected hai
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

// Example:
// GET /e3eb3b2b
//
// Yahan "e3eb3b2b" hamara shortCode hai.
app.get("/:shortCode", async (req, res) => {

  // URL se shortCode nikal rahe hain
  //
  // /e3eb3b2b
  //       ↓
  // shortCode = "e3eb3b2b"
  const { shortCode } = req.params;

  try {

    // Database mein shortCode search kar rahe hain
    //
    // id bhi select kar rahe hain because
    // clicks table mein url_id ke liye iska use hoga.
    const result = await pool.query(
      "SELECT id, original_url FROM urls WHERE short_code = $1",
      [shortCode]
    );


    // Agar shortCode database mein nahi mila
    if (result.rows.length === 0) {

      return res.status(404).json({
        message: "Short URL not found",
      });
    }


    // Database se original URL nikal rahe hain
    //
    // Example:
    // original_url = "https://google.com"
    const originalUrl = result.rows[0].original_url;


    // URLs table ki ID nikal rahe hain
    //
    // Example:
    // urlId = 1
    //
    // Ye clicks table ke url_id se connect hogi.
    const urlId = result.rows[0].id;


    // --------------------------------------------------
    // Click Tracking
    // --------------------------------------------------

    // Har baar short URL open hone par
    // clicks table mein ek new record create hoga.
    await pool.query(
      "INSERT INTO clicks (url_id, referrer) VALUES ($1, $2)",
      [urlId, req.get("referer") || null]
    );


    // Finally user ko original URL par redirect kar do
    //
    // 302 = Temporary Redirect
    res.redirect(302, originalUrl);

  } catch (error) {

    // Server/database error terminal mein print hoga
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// --------------------------------------------------
// 3. URL API Routes
// --------------------------------------------------

// Example:
// POST /api/shorten
//
// Ye route urlRoutes.js ke andar defined hai.
app.use("/api", routes);


// app ko server.js ke through export kar rahe hain
module.exports = app;