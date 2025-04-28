import Redis from "ioredis";
import client from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Initialize Redis client (you actually don't need this again if you already imported client)
const redis = new Redis(process.env.UPSTASH_REDIS_URL);

// Helper: Generate access and refresh tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

// Helper: Store refresh token in Redis
const storeRefreshToken = async (userId, refreshToken) => {
    await client.set(`refreshToken:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7 days expiration
};

// Helper: Set tokens as cookies
const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// Signup Controller
export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password });

        const { accessToken, refreshToken } = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            tokens: { accessToken, refreshToken }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};

// Login Controller
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && await user.comparePassword(password)) {
            const { accessToken, refreshToken } = generateTokens(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            res.status(200).json({
                message: "Login successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                tokens: { accessToken, refreshToken }
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

// Logout Controller
export const logout = async (req, res) => {
    try {
        const refreshTokenFromCookie = req.cookies.refreshToken;
        if (refreshTokenFromCookie) {
            const decoded = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_TOKEN_SECRET);
            await client.del(`refreshToken:${decoded.userId}`);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message: "Logout successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error logging out", error: error.message });
    }
};

// Refresh Token Controller
export const refreshToken = async (req, res) => {
    try {
        const refreshTokenFromCookie = req.cookies.refreshToken;
        if (!refreshTokenFromCookie) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        const decoded = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await client.get(`refreshToken:${decoded.userId}`);

        if (storedToken !== refreshTokenFromCookie) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.json({ accessToken: newAccessToken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error refreshing token", error: error.message });
    }
};
//export const getProfile = async (req, res) => {