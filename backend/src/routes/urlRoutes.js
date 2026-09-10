const express = require("express");
const router = express.Router();

const {
  createShortUrl,
  redirectToOriginal,
  getAnalytics,
  getAllUrls,
  deleteUrl
} = require("../controllers/urlController");

router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

router.get("/urls", getAllUrls);
router.post("/shorten", createShortUrl);
router.get("/analytics/:shortCode", getAnalytics);
router.get("/:shortCode", redirectToOriginal);
router.delete("/urls/:shortCode", deleteUrl);

module.exports = router;