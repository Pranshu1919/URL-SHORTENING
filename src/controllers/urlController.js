const Url = require("../models/urlModel");
const Counter = require("../models/counterModel");
const toBase62 = require("../utils/base62");
const validator = require("validator");
const { getRedisClient } = require("../config/redis");
const ClickLog = require("../models/clickLogModel");


const createShortUrl = async (req, res) => {
  try {
    const { originalUrl, expiryInMinutes } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: "Original URL is required" });
    }

    if (!validator.isURL(originalUrl, { require_protocol: true })) {
      return res
        .status(400)
        .json({ message: "Invalid URL (include http/https)" });
    }

 
    let expiresAt = null;
    if (expiryInMinutes) {
      expiresAt = new Date(Date.now() + expiryInMinutes * 60 * 1000);
    }

    const existingUrl = await Url.findOne({ originalUrl }).lean();
    if (existingUrl) {
      return res.status(200).json({
        shortCode: existingUrl.shortCode,
        originalUrl: existingUrl.originalUrl,
        clicks: existingUrl.clicks,
        expiresAt: existingUrl.expiresAt,
      });
    }
    const counter = await Counter.findOneAndUpdate(
      { name: "urlCounter" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const shortCode = toBase62(counter.seq);

    const newUrl = await Url.create({
      shortCode,
      originalUrl,
      clicks: 0,
      expiresAt,
    });

    return res.status(201).json({
      shortCode: newUrl.shortCode,
      originalUrl: newUrl.originalUrl,
      expiresAt: newUrl.expiresAt,
    });
  } catch (error) {
    console.error("Create Short URL Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


const redirectToOriginal = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const redisClient = getRedisClient();

    let originalUrl;

   
    const cachedUrl = await redisClient.get(shortCode);

    if (cachedUrl) {
      originalUrl = cachedUrl;
    } else {
      
      const url = await Url.findOne({ shortCode }).lean();

      if (!url) {
        return res.status(404).json({ message: "URL not found" });
      }

      if (url.expiresAt && url.expiresAt < new Date()) {
        return res.status(410).json({ message: "Link expired" });
      }

      originalUrl = url.originalUrl;

    
      const ttl = url.expiresAt
        ? Math.floor((url.expiresAt - Date.now()) / 1000)
        : 3600;

      if (ttl > 0) {
        await redisClient.set(shortCode, originalUrl, { EX: ttl });
      }
    }

    
    await Promise.all([
      Url.updateOne({ shortCode }, { $inc: { clicks: 1 } }),
      ClickLog.create({
        shortCode,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      }),
      redisClient.incr(`clicks:${shortCode}`)
    ]);

    return res.redirect(originalUrl);

  } catch (error) {
    console.error("Redirect Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


const getAnalytics = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const redisClient = getRedisClient();

    const url = await Url.findOne({ shortCode }).lean();

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).json({ message: "Link expired" });
    }

    let redisClicks = 0;
    try {
      const value = await redisClient.get(`clicks:${shortCode}`);
      redisClicks = value ? Number(value) : 0;
    } catch (err) {
      console.error("Redis fetch error:", err);
    }

    const totalClicks = url.clicks + redisClicks;

    return res.status(200).json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      totalClicks,
      persistentClicks: url.clicks,
      realtimeClicks: redisClicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


module.exports = {
  createShortUrl,
  redirectToOriginal,
  getAnalytics,
};
