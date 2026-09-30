const express = require("express");
const { createShortUrl,
  getStats,
 } = require("../controllers/urlController");

const router = express.Router();

router.post("/shorten", createShortUrl);
router.get("/stats/:shortCode", getStats);
module.exports = router;