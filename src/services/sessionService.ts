import pool from "../config/database";
import { Answer } from "../types/Answer";

export const sessionService = {
    createSession: async (
        userId: string,
        mode: string,
        difficulty: string,
        operation: string,
        range: string,
    ) => {
        const questionCount = 15;
        let overallTimeLimit: number;

        const modeId = await getModeId(mode);
        const operationId = await getOperationId(operation);
        const rangeId = await getRangeId(range);
        const difficultyId = await getDifficultyId(difficulty);

        switch (difficulty.toLowerCase()) {
            case "easy":
                overallTimeLimit = 15 * 60; // 15 minutes in seconds
                break;
            case "medium":
                overallTimeLimit = 10 * 60; // 10 minutes in seconds
                break;
            case "hard":
                overallTimeLimit = 5 * 60; // 5 minutes in seconds
                break;
            default:
                overallTimeLimit = 15 * 60; // Default to Easy mode time limit
        }

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

        return result.rows[0].id;
    },

    getModes: async () => {
        const result = await pool.query("SELECT id, mode_name FROM modes");
        return result.rows;
    },

    getOperations: async () => {
        const result = await pool.query(
            "SELECT id, operation_name FROM operations",
        );
        return result.rows;
    },

    getRanges: async () => {
        const result = await pool.query(
            "SELECT id, range_name FROM number_ranges",
        );
        return result.rows;
    },

    getDifficulties: async () => {
        const result = await pool.query(
            "SELECT id, level_name FROM difficulty_levels",
        );
        return result.rows;
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

async function getModeId(modeName: string): Promise<number> {
    console.log("modeName", modeName);
    const result = await pool.query(
        "SELECT id FROM modes WHERE mode_name = $1",
        [modeName],
    );
    if (result.rows.length === 0) throw new Error(`Invalid mode: ${modeName}`);
    return result.rows[0].id;
}

async function getOperationId(operationName: string): Promise<number> {
    const result = await pool.query(
        "SELECT id FROM operations WHERE operation_name = $1",
        [operationName],
    );
    if (result.rows.length === 0)
        throw new Error(`Invalid operation: ${operationName}`);
    return result.rows[0].id;
}

async function getRangeId(rangeName: string): Promise<number> {
    const result = await pool.query(
        "SELECT id FROM number_ranges WHERE range_name = $1",
        [rangeName],
    );
    if (result.rows.length === 0)
        throw new Error(`Invalid range: ${rangeName}`);
    return result.rows[0].id;
}

async function getDifficultyId(difficultyName: string): Promise<number> {
    const result = await pool.query(
        "SELECT id FROM difficulty_levels WHERE level_name = $1",
        [difficultyName],
    );
    if (result.rows.length === 0)
        throw new Error(`Invalid difficulty: ${difficultyName}`);
    return result.rows[0].id;
}
