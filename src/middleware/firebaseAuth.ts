import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import serviceAccount from "../config/firebase-adminsdk-key.json";

// Add this type declaration
declare global {
    namespace Express {
        interface Request {
            user?: admin.auth.DecodedIdToken;
        }
    }
}

// Initialize Firebase Admin SDK (you'll need to set up your Firebase credentials)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount,
        ),
    });
}

export const firebaseAuth = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Error verifying Firebase token:", error);
        res.status(403).json({ error: "Invalid token" });
    }
};
