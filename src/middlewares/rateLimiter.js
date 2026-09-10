const { getRedisClient } = require("../config/redis");

const RATE_LIMIT = 100;           
const WINDOW_SECONDS = 900;      

const slidingWindowRateLimiter = async (req, res, next) => {
  try {
    const redisClient = getRedisClient();

    const ip = req.ip;
    const key = `rate_limit:${ip}`;

    const now = Date.now();
    const windowStart = now - WINDOW_SECONDS * 1000;


    await redisClient.zRemRangeByScore(key, 0, windowStart);

 
    const requestCount = await redisClient.zCard(key);

    if (requestCount >= RATE_LIMIT) {
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
      });
    }

    await redisClient.zAdd(key, {
      score: now,
      value: `${now}-${Math.random()}`, 
    });

    await redisClient.expire(key, WINDOW_SECONDS);

    next();
  } catch (error) {
    console.error("Sliding window rate limit error:", error);

    next();
  }
};

module.exports = slidingWindowRateLimiter;
