import pool from "../config/database";
import { generateQuestions } from "../utils/questionGenerator";
import { Operation } from "../types/session";

export const questionService = {
    getQuestions: async (sessionId: string) => {
        const client = await pool.connect();
        try {
            const sessionQuery = "SELECT * FROM sessions WHERE id = $1";
            const sessionResult = await client.query(sessionQuery, [sessionId]);

            if (sessionResult.rows.length === 0) {
                throw new Error("Session not found");
            }

            const session = sessionResult.rows[0];

            console.log("SESSION", session);
            const { question_count } = session;

            const termsQuery =
                "SELECT * FROM session_terms WHERE session_id = $1";
            const termsResult = await client.query(termsQuery, [sessionId]);
            const {
                term_a_min,
                term_a_max,
                term_a_multiple,
                term_b_min,
                term_b_max,
                term_b_multiple,
            } = termsResult.rows[0];

            const operationsQuery =
                "SELECT o.operation_name FROM session_operations so JOIN operations o ON so.operation_id = o.id WHERE so.session_id = $1";
            const operationsResult = await client.query(operationsQuery, [
                sessionId,
            ]);

            const operations = operationsResult.rows.map(row =>
                row.operation_name.toLowerCase(),
            );

            const questions = generateQuestions(
                question_count,
                { min: term_a_min, max: term_a_max, multiple: term_a_multiple },
                { min: term_b_min, max: term_b_max, multiple: term_b_multiple },
                operations as Operation[],
            );

            return questions;
        } finally {
            client.release();
        }
    },

    submitAnswers: async (sessionId: string, answers: any[]) => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

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
                const {
                    questionIndex,
                    selectedAnswer,
                    timeTaken,
                    numberA,
                    numberB,
                    operation,
                    isCorrect,
                } = answer;

                if (isCorrect) {
                    correctCount++;
                }

                const insertAnswerQuery = `
                    INSERT INTO user_answers (
                        user_id, 
                        session_id, 
                        selected_answer, 
                        time_taken, 
                        question_index,
                        number_a,
                        number_b,
                        operation,
                        is_correct
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `;
                await client.query(insertAnswerQuery, [
                    user_id,
                    sessionId,
                    selectedAnswer,
                    timeTaken,
                    questionIndex,
                    numberA,
                    numberB,
                    operation,
                    isCorrect,
                ]);

                totalTime += timeTaken;
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
        const client = await pool.connect();
        try {
            const sessionQuery = "SELECT * FROM sessions WHERE id = $1";
            const sessionResult = await client.query(sessionQuery, [sessionId]);

            if (sessionResult.rows.length === 0) {
                throw new Error("Session not found");
            }

            const session = sessionResult.rows[0];

            const answersQuery =
                "SELECT * FROM user_answers WHERE session_id = $1";
            const answersResult = await client.query(answersQuery, [sessionId]);

            const totalQuestions = answersResult.rows.length;
            const correctAnswers = answersResult.rows.filter(
                answer => answer.is_correct,
            ).length;
            const wrongAnswers = totalQuestions - correctAnswers;
            const totalTime = answersResult.rows.reduce(
                (sum, answer) => sum + answer.time_taken,
                0,
            );

            return {
                sessionId,
                totalQuestions,
                correctAnswers,
                wrongAnswers,
                totalTime,
            };
        } finally {
            client.release();
        }
    },
};
