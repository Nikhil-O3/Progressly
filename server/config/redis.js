import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null, // do not continuously retry if offline
  enableOfflineQueue: false,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => {
  // Gracefully log once or ignore if local redis is not running
});

export default redis;

