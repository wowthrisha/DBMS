import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    const accessTokenFromCookie = req.cookies.accessToken;
    if (!accessTokenFromCookie) {
        return res.status(401).json({ message: "No access token provided" });
    }

    try {
        const decoded = jwt.verify(accessTokenFromCookie, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Access token expired" });
        }
        return res.status(401).json({ message: "Invalid access token" });
    }
};

export const adminRoute = async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ message: "You are not authorized to access this route" });
    }
};
