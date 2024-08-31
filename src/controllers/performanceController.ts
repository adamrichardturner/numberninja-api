import { Request, Response } from "express";
import pool from "../config/database";

export const getSessionData = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = req.user.uid;
        const { period } = req.query;

        const startDate = getStartDate(period as string);
        const query = `
            SELECT 
                COUNT(*) as total_sessions,
                AVG(EXTRACT(EPOCH FROM (ended_at - started_at)) / 60) as average_duration,
                COUNT(*) FILTER (WHERE is_completed = true) as completed_sessions
            FROM sessions
            WHERE user_id = $1 AND started_at >= $2
        `;
        const result = await pool.query(query, [userId, startDate]);

        const { total_sessions, average_duration, completed_sessions } =
            result.rows[0];
        const averageScore =
            completed_sessions > 0
                ? (completed_sessions / total_sessions) * 100
                : 0;

        res.json({
            totalSessions: parseInt(total_sessions),
            averageScore: parseFloat(averageScore.toFixed(2)),
            timeSpent: Math.round(parseFloat(average_duration)),
        });
    } catch (error) {
        console.error("Error fetching session data:", error);
        res.status(500).json({ error: "Failed to fetch session data" });
    }
};

export const getOperationPerformance = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = req.user.uid;

        const query = `
            SELECT 
                o.operation_name,
                COUNT(*) as total_questions,
                COUNT(*) FILTER (WHERE ua.is_correct = true) as correct_answers
            FROM sessions s
            JOIN operations o ON s.operation_id = o.id
            JOIN questions q ON q.session_id = s.id
            JOIN user_answers ua ON ua.question_id = q.id
            WHERE s.user_id = $1
            GROUP BY o.operation_name
        `;
        const result = await pool.query(query, [userId]);

        const operationPerformance = result.rows.map(row => ({
            operation: row.operation_name,
            score: Math.round(
                (row.correct_answers / row.total_questions) * 100,
            ),
            wrongAnswers: row.total_questions - row.correct_answers,
        }));

        res.json(operationPerformance);
    } catch (error) {
        console.error("Error fetching operation performance:", error);
        res.status(500).json({
            error: "Failed to fetch operation performance",
        });
    }
};

export const getCommonWrongAnswers = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = req.user.uid;

        const query = `
            SELECT 
                q.question_data,
                COUNT(*) as count
            FROM user_answers ua
            JOIN questions q ON ua.question_id = q.id
            JOIN sessions s ON q.session_id = s.id
            WHERE s.user_id = $1 AND ua.is_correct = false
            GROUP BY q.question_data
            ORDER BY count DESC
            LIMIT 5
        `;
        const result = await pool.query(query, [userId]);

        const commonWrongAnswers = result.rows;

        res.json(commonWrongAnswers);
    } catch (error) {
        console.error("Error fetching common wrong answers:", error);
        res.status(500).json({ error: "Failed to fetch common wrong answers" });
    }
};

function getStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
        case "week":
            return new Date(now.setDate(now.getDate() - 7));
        case "month":
            return new Date(now.setMonth(now.getMonth() - 1));
        case "year":
            return new Date(now.setFullYear(now.getFullYear() - 1));
        default:
            return new Date(now.setMonth(now.getMonth() - 1)); // Default to last month
    }
}
