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
