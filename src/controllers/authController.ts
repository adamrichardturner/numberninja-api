import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database";

export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email],
        );
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        const result = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
            [email, hashedPassword],
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({ error: "Error registering user" });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email],
        );
        const user = result.rows[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET as string,
                { expiresIn: "6m" },
            );
            res.json({ token });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error logging in" });
    }
};
