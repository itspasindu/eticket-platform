const Redis = require("ioredis");

const createNoopRedis = () => ({
  setex: async () => null,
  del: async () => null,
});

const redisUrl = process.env.REDIS_URL?.trim();

if (!redisUrl) {
  console.warn("Redis disabled: REDIS_URL is not set");
  module.exports = createNoopRedis();
} else {
  const client = new Redis(redisUrl, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    retryStrategy: () => null,
    reconnectOnError: () => false,
    connectTimeout: 5000,
  });

  client.on("connect", () => {
    console.log("Redis Connected!");
  });

  client.on("end", () => {
    console.warn("Redis connection closed; continuing without Redis");
  });

  client.on("error", (err) => {
    console.error("Redis Error:", err);
  });

  client.connect().catch((err) => {
    console.error("Redis initial connection failed:", err.message);
  });

  module.exports = {
    setex: async (...args) => {
      if (client.status !== "ready") {
        return null;
      }

      try {
        return await client.setex(...args);
      } catch (error) {
        console.error("Redis setex failed:", error.message);
        return null;
      }
    },
    del: async (...args) => {
      if (client.status !== "ready") {
        return null;
      }

      try {
        return await client.del(...args);
      } catch (error) {
        console.error("Redis del failed:", error.message);
        return null;
      }
    },
  };
}
