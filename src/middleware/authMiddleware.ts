import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const token = req.headers.authorization?.split("Bearer ")[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ error: "Invalid token" });
    }
};
