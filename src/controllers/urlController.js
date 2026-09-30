const crypto = require("crypto");

const pool = require("../config/db");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
// --------------------------------------------------
// CREATE SHORT URL
// --------------------------------------------------

const createShortUrl = async (req, res) => {

  const { url } = req.body;



if (!url) {
  return res.status(400).json({
    message: "URL is required",
  });
}

try {
  const parsedUrl = new URL(url);

  if (
    parsedUrl.protocol !== "http:" &&
    parsedUrl.protocol !== "https:"
  ) {
    return res.status(400).json({
      message: "Invalid URL",
    });
  }
} catch (err) {
  return res.status(400).json({
    message: "Invalid URL",
  });
}

    // Short code banao; collision ho toh max 5 baar retry
  for (let attempt = 0; attempt < 5; attempt++) {
    const shortCode = crypto.randomBytes(5).toString("base64url").slice(0, 7);

    try {
      await pool.query(
        "INSERT INTO urls (original_url, short_code) VALUES ($1, $2)",
        [url, shortCode]
      );

      return res.status(201).json({
        shortCode,
        shortUrl: `${BASE_URL}/${shortCode}`,
      });
    } catch (error) {
      // 23505 = unique violation (ye code pehle se exist karta hai)
      if (error.code === "23505") continue;

      console.error(error);
      return res.status(500).json({ message: "Failed to create short URL" });
    }
  }

  return res.status(500).json({ message: "Could not generate a unique code" });
};

// --------------------------------------------------
// GET URL STATS
// --------------------------------------------------
const getStats = async (req, res) => {
  const { shortCode } = req.params;

  try {
    // 1. Find URL ID using short code
    const urlResult = await pool.query(
      "SELECT id FROM urls WHERE short_code = $1",
      [shortCode]
    );

    if (urlResult.rows.length === 0) {
      return res.status(404).json({
        message: "Short URL not found",
      });
    }

    const urlId = urlResult.rows[0].id;

    // 2. Get total clicks
    const clickResult = await pool.query(
      "SELECT COUNT(*) AS total_clicks FROM clicks WHERE url_id = $1",
      [urlId]
    );

    const totalClicks = Number(clickResult.rows[0].total_clicks);

    // 3. Get clicks per day
    const clicksPerDayResult = await pool.query(
           `
        SELECT TO_CHAR(clicked_at, 'YYYY-MM-DD') AS date, COUNT(*) AS clicks
        FROM clicks
        WHERE url_id = $1
        GROUP BY 1
        ORDER BY 1;
      `,
      [urlId]
    );

    // 4. Get clicks by referrer
    const referrerResult = await pool.query(
      `
        SELECT referrer, COUNT(*) AS clicks
        FROM clicks
        WHERE url_id = $1
        GROUP BY referrer
        ORDER BY COUNT(*) DESC;
      `,
      [urlId]
    );


const referrers = referrerResult.rows.map((row) => ({
  referrer: row.referrer,
  clicks: Number(row.clicks),
}));
const clicksPerDay = clicksPerDayResult.rows.map((row) => ({
  date: row.date,
  clicks: Number(row.clicks),
}));
    // 5. Send all analytics
res.json({
  shortCode: shortCode,
  totalClicks: totalClicks,
  clicksPerDay: clicksPerDay,
  referrers: referrers,
});
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch stats",
    });
  }
};

// Export controllers
module.exports = {
  createShortUrl,
  getStats,
};