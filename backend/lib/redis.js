// redis.js
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Create and export a Redis client
const client = new Redis(process.env.UPSTASH_REDIS_URL, {
  maxRetriesPerRequest: 5,
  tls: {} // required for rediss:// (SSL connection)
});

client.on('connect', () => {
    console.log('Connected to Upstash Redis!');
});

client.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export default client;
