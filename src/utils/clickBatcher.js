const { getRedisClient } = require("../config/redis");
const Url = require("../models/urlModel");

const FLUSH_INTERVAL = 60000; 

const startClickBatcher = () => {
  setInterval(async () => {
    try {
      const redis = getRedisClient();
      if (!redis) return;

      const keys = await redis.keys("clicks:*");

      if (!keys.length) {
        console.log("No click keys to flush");
        return;
      }

      for (const key of keys) {
        const shortCode = key.split(":")[1];

        const rawCount = await redis.get(key);
        if (!rawCount) continue;

        const count = Number(rawCount);

        if (Number.isNaN(count) || count <= 0) continue;

        await Url.updateOne(
          { shortCode },
          { $inc: { clicks: count } }
        );

        await redis.del(key);
      }

      console.log("Click batch flush completed");
    } catch (error) {
      console.error("Batcher error:", error.message);
    }
  }, FLUSH_INTERVAL);
};

module.exports = startClickBatcher;
