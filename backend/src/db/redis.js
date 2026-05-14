const Redis = require("ioredis");
const appConfig = require("../config");

const redis = new Redis(appConfig.redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
  enableOfflineQueue: false,
  retryStrategy: () => null,
});

let hasLoggedRedisError = false;

redis.on("error", (error) => {
  if (!appConfig.isTest && !hasLoggedRedisError) {
    hasLoggedRedisError = true;
    const message = error?.message || "Unable to connect to Redis.";
    console.error("Redis error:", message);
  }
});

async function connectRedis() {
  if (redis.status === "ready") {
    return redis;
  }

  if (redis.status !== "connecting" && redis.status !== "connect") {
    await redis.connect();
  }

  await redis.ping();
  return redis;
}

module.exports = {
  redis,
  connectRedis,
};
