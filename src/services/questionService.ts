import pool from "../config/database";
import { generateQuestions, checkAnswer } from "../utils/questionGenerator";

// Mapping from range UUIDs to numeric ranges
const rangeMapping: { [key: string]: number } = {
    "2fc48105-33cd-45bd-957b-850cde45c6e9": 10,
    "737c2b8d-81c1-491b-a9de-2dc9570793e1": 20,
    "7cb12fa0-0e35-4e64-9c0a-2a852363e81c": 100,
};

// Mapping from operation UUIDs to operation names
const operationMapping: { [key: string]: string } = {
    "679da447-9c0d-4c2f-b95e-aa2aa6d52342": "addition",
    "739374c2-e5c9-4436-856e-2ca6c30e7c54": "subtraction",
    "e69005d4-1617-41c4-bc4a-850369e0a9df": "multiplication",
    "cc188a7b-8653-4a00-9267-be2623c238f8": "division",
};

export const questionService = {
    getQuestions: async (sessionId: string) => {
        const sessionQuery = "SELECT * FROM sessions WHERE id = $1";
        const sessionResult = await pool.query(sessionQuery, [sessionId]);

        if (sessionResult.rows.length === 0) {
            throw new Error("Session not found");
        }

        const session = sessionResult.rows[0];
        const { question_count, range_id, operation_id } = session;

        const rangeSelected = rangeMapping[range_id] || 10;
        const operationSelected = operationMapping[operation_id];

        if (!operationSelected) {
            throw new Error(`Invalid operation_id: ${operation_id}`);
        }

        return generateQuestions(
            sessionId,
            question_count,
            rangeSelected,
            operationSelected,
        );
    },

    submitAnswers: async (sessionId: string, answers: any[]) => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            console.log("Received answers:", answers);

            const sessionQuery = "SELECT * FROM sessions WHERE id = $1";
            const sessionResult = await client.query(sessionQuery, [sessionId]);

            if (sessionResult.rows.length === 0) {
                throw new Error("Session not found");
            }

            const session = sessionResult.rows[0];
            const { user_id } = session;

            let correctCount = 0;
            let totalTime = 0;

            for (const answer of answers) {
                const { questionIndex, selectedAnswer, timeTaken } = answer;
                const isCorrect = Boolean(answer.isCorrect); // Ensure it's a boolean

                if (isCorrect) {
                    correctCount++;
                }
                totalTime += timeTaken;

                const insertAnswerQuery = `
                    INSERT INTO user_answers (
                        user_id, 
                        session_id, 
                        selected_answer, 
                        is_correct, 
                        time_taken, 
                        question_index
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                `;
                await client.query(insertAnswerQuery, [
                    user_id,
                    sessionId,
                    selectedAnswer,
                    isCorrect,
                    timeTaken,
                    questionIndex,
                ]);
            }

            const updateSessionQuery = `
                UPDATE sessions
                SET ended_at = NOW(), is_completed = true
                WHERE id = $1
            `;
            await client.query(updateSessionQuery, [sessionId]);

            await client.query("COMMIT");

            return {
                correctAnswers: correctCount,
                totalQuestions: answers.length,
                totalTime,
            };
        } catch (error) {
            await client.query("ROLLBACK");
            console.error("Error in submitAnswers:", error);
            throw error;
        } finally {
            client.release();
        }
    },

    getSessionResults: async (sessionId: string) => {
        const sessionQuery = "SELECT * FROM sessions WHERE id = $1";
        const sessionResult = await pool.query(sessionQuery, [sessionId]);

        if (sessionResult.rows.length === 0) {
            throw new Error("Session not found");
        }

        const session = sessionResult.rows[0];

        const answersQuery = "SELECT * FROM answers WHERE session_id = $1";
        const answersResult = await pool.query(answersQuery, [sessionId]);

        const totalQuestions = answersResult.rows.length;
        const correctAnswers = answersResult.rows.filter(
            answer => answer.is_correct,
        ).length;
        const wrongAnswers = totalQuestions - correctAnswers;

        return {
            sessionId,
            totalQuestions,
            correctAnswers,
            wrongAnswers,
            totalTime: session.total_time,
        };
    },
};
