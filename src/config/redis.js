const { createClient } = require("redis");

let redisClient;

const connectRedis = async () => {
  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 1) {
          return new Error("Redis connection retries exhausted");
        }
        return 500;
      },
    },
  });

  redisClient.on("error", (err) => {
    if (err.code !== "ECONNREFUSED") {
      console.error("Redis Client Error:", err.message);
    }
  });

  try {
    await redisClient.connect();
    console.log("Redis Connected ✅");
  } catch (err) {
    console.log("ℹ️ Redis not available locally (running in standalone DB mode)");
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };

