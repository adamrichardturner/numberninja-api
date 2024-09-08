import pool from "../config/database";
import { Answer } from "../types/Answer";
import { Operation } from "../types/session";

export const sessionService = {
    createSession: async (
        firebaseUid: string,
        mode: string,
        operations: Operation[],
        range: { min: number; max: number },
        difficulty: string,
        termA: number,
        termB: number,
    ) => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Insert session
            const sessionResult = await client.query(
                "INSERT INTO sessions (user_id, mode_id, difficulty_id, question_count, overall_time_limit, started_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id",
                [firebaseUid, mode, difficulty, 20, 600], // Adjust question_count and overall_time_limit as needed
            );
            const sessionId = sessionResult.rows[0].id;

            // Insert operations
            for (const operation of operations) {
                await client.query(
                    "INSERT INTO session_operations (session_id, operation_id) VALUES ($1, $2)",
                    [sessionId, operation],
                );
            }

            // Insert range
            const minValue = range.min ?? 1; // Provide a default value if min is null
            const maxValue = range.max ?? 100; // Provide a default value if max is null
            await client.query(
                "INSERT INTO session_ranges (session_id, min_value, max_value) VALUES ($1, $2, $3)",
                [sessionId, minValue, maxValue],
            );

            // Insert terms
            await client.query(
                "INSERT INTO session_terms (session_id, term_a, term_b) VALUES ($1, $2, $3)",
                [sessionId, termA, termB],
            );

            await client.query("COMMIT");

            return sessionId;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },

    getModes: async () => {
        const result = await pool.query("SELECT id, mode_name FROM modes");
        return result.rows;
    },

    getOperations: async () => {
        const client = await pool.connect();
        try {
            const result = await client.query(
                "SELECT id, operation_name FROM operations",
            );
            return result.rows;
        } finally {
            client.release();
        }
    },

    getRanges: async () => {
        const result = await pool.query(
            "SELECT id, range_name FROM number_ranges",
        );
        return result.rows;
    },

    getDifficulties: async () => {
        const client = await pool.connect();
        try {
            const result = await client.query(
                "SELECT id, level_name FROM difficulty_levels",
            );
            return result.rows;
        } finally {
            client.release();
        }
    },

    getQuestions: async (sessionId: string) => {
        const result = await pool.query(
            "SELECT * FROM questions WHERE session_id = $1",
            [sessionId],
        );
        return result.rows;
    },

    submitAnswers: async (
        sessionId: string,
        answers: Answer[],
    ): Promise<void> => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            for (const answer of answers) {
                await client.query(
                    `INSERT INTO user_answers (session_id, question_id, selected_answer, is_correct, time_taken, answered_at)
                     VALUES ($1, $2, $3, $4, $5, NOW())`,
                    [
                        sessionId,
                        answer.questionId,
                        answer.userAnswer,
                        answer.isCorrect,
                        answer.timeTaken,
                    ],
                );
            }

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            console.error("Error submitting answers:", error);
            throw error;
        } finally {
            client.release();
        }
    },

    getSessionResults: async (sessionId: string) => {
        const result = await pool.query(
            `SELECT s.id as session_id, s.overall_time_limit,
                    COUNT(ua.id) as total_questions,
                    SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct_answers,
                    SUM(ua.time_taken) as total_time_taken
             FROM sessions s
             LEFT JOIN user_answers ua ON s.id = ua.session_id
             WHERE s.id = $1
             GROUP BY s.id`,
            [sessionId],
        );

        if (result.rows.length === 0) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        return result.rows[0];
    },

    endSession: async (sessionId: string) => {
        const result = await pool.query(
            `UPDATE sessions SET ended_at = NOW() WHERE id = $1 RETURNING *`,
            [sessionId],
        );
        if (result.rows.length === 0) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        return result.rows[0];
    },
};
