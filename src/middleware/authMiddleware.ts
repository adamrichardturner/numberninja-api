import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split("Bearer ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};
