import { Request, Response } from "express";
import pool from "../config/database";

export const createSession = async (req: Request, res: Response) => {
    const {
        userId,
        modeId,
        operationId,
        rangeId,
        difficultyId,
        questionCount,
        overallTimeLimit,
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO sessions (user_id, mode_id, operation_id, range_id, difficulty_id, question_count, overall_time_limit)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [
                userId,
                modeId,
                operationId,
                rangeId,
                difficultyId,
                questionCount,
                overallTimeLimit,
            ],
        );

        res.status(201).json({ sessionId: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: "Error creating session" });
    }
};

// Get available modes
export const getModes = async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT id, mode_name FROM modes");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching modes:", error);
        res.status(500).json({ error: "Error fetching modes" });
    }
};

// Get available operations
export const getOperations = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT id, operation_name FROM operations",
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching operations:", error);
        res.status(500).json({ error: "Error fetching operations" });
    }
};

// Get available number ranges
export const getRanges = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT id, range_name FROM number_ranges",
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching ranges:", error);
        res.status(500).json({ error: "Error fetching ranges" });
    }
};

// Get available difficulty levels
export const getDifficulties = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT id, level_name FROM difficulty_levels",
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching difficulties:", error);
        res.status(500).json({ error: "Error fetching difficulties" });
    }
};
