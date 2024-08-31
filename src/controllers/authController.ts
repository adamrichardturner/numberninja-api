import { Request, Response } from "express";
import admin from "firebase-admin";
import pool from "../config/database";

export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        await pool.query("INSERT INTO users (id, email) VALUES ($1, $2)", [
            userRecord.uid,
            email,
        ]);

        res.status(201).json({
            message: "User registered successfully",
            user: { id: userRecord.uid, email },
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Error registering user" });
    }
};

export const login = async (req: Request, res: Response) => {
    // Firebase authentication is handled on the client-side
    // This endpoint is not needed for Firebase auth
    res.status(400).json({
        error: "Use Firebase client SDK for authentication",
    });
};
