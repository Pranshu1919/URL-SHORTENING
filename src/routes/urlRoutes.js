const express = require("express");
const router = express.Router();

const {
  createShortUrl,
  redirectToOriginal,getAnalytics
} = require("../controllers/urlController");

router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

router.post("/", createShortUrl);
router.get("/:shortCode", redirectToOriginal);
router.get("/analytics/:shortCode", getAnalytics);
module.exports = router;
