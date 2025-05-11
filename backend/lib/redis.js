// redis.js
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redis = null;
let isConnecting = false;
let connectionAttempts = 0;
const MAX_ATTEMPTS = 3;

export const connectRedis = async () => {
    // If already connected or connecting, return existing instance
    if (redis || isConnecting) return redis;
    
    // If we've tried too many times, give up
    if (connectionAttempts >= MAX_ATTEMPTS) {
        console.log("Redis connection disabled after multiple failed attempts");
        return null;
    }

    isConnecting = true;
    connectionAttempts++;

    try {
        // Use Upstash Redis URL from environment variable
        const redisUrl = process.env.UPSTASH_REDIS_URL;
        if (!redisUrl) {
            throw new Error("UPSTASH_REDIS_URL environment variable is not set");
        }

        // Configure Redis client for Upstash
        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            retryStrategy: (times) => {
                if (times > 2) return null; // Stop retrying after 2 attempts
                return Math.min(times * 100, 1000);
            },
            enableOfflineQueue: false,
            connectTimeout: 5000,
            tls: {
                rejectUnauthorized: false // Required for Upstash Redis
            }
        });

        // Handle connection events
        redis.on('connect', () => {
            console.log('Redis client connected');
            connectionAttempts = 0; // Reset attempts on successful connection
        });

        redis.on('error', (err) => {
            if (connectionAttempts === 1) {
                console.error('Redis connection error:', err.message);
                console.log('Continuing without Redis...');
            }
            redis = null;
        });

        redis.on('ready', () => {
            console.log('Redis client ready');
        });

        await redis.ping();
        console.log("Redis connected successfully");
        return redis;
    } catch (error) {
        if (connectionAttempts === 1) {
            console.error("Error connecting to Redis:", error.message);
            console.log("Continuing without Redis...");
        }
        redis = null;
        return null;
    } finally {
        isConnecting = false;
    }
};

export const getRedis = () => redis;

// Helper function to safely use Redis
export const withRedis = async (operation) => {
    if (!redis) return null;
    try {
        return await operation(redis);
    } catch (error) {
        console.error('Redis operation failed:', error.message);
        return null;
    }
};

export default redis;
