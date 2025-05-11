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
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 3) return null; // Stop retrying after 3 attempts
                return Math.min(times * 200, 2000);
            },
            enableOfflineQueue: true,
            connectTimeout: 10000,
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
            console.error('Redis connection error:', err.message);
            redis = null;
        });

        redis.on('ready', () => {
            console.log('Redis client ready');
        });

        // Wait for connection to be ready
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Redis connection timeout'));
            }, 10000);

            redis.once('ready', () => {
                clearTimeout(timeout);
                resolve();
            });

            redis.once('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });

        console.log("Redis connected successfully");
        return redis;
    } catch (error) {
        console.error("Error connecting to Redis:", error.message);
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
