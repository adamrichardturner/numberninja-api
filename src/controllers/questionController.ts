import { Request, Response } from "express";
import { generateQuestions, checkAnswer } from "../utils/questionGenerator";
import pool from "../config/database";

export const getQuestions = async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    try {
        const session = await pool.query(
            "SELECT * FROM sessions WHERE id = $1",
            [sessionId],
        );

        if (!session.rows.length) {
            return res.status(404).json({ error: "Session not found" });
        }

        const { questionCount, range_id, operation_id } = session.rows[0];
        const questions = generateQuestions(
            sessionId,
            questionCount,
            range_id,
            operation_id,
        );

        res.status(200).json({ questions });
    } catch (error) {
        res.status(500).json({ error: "Error fetching questions" });
    }
};

export const submitAnswer = async (req: Request, res: Response) => {
    const { sessionId, questionIndex, selectedAnswer, timeTaken } = req.body;

    try {
        const session = await pool.query(
            "SELECT * FROM sessions WHERE id = $1",
            [sessionId],
        );

        if (!session.rows.length) {
            return res.status(404).json({ error: "Session not found" });
        }

        const { user_id, operation_id, range_id } = session.rows[0];
        const { isCorrect, correctAnswer } = checkAnswer(
            sessionId,
            questionIndex,
            selectedAnswer,
            range_id,
            operation_id,
        );

        await pool.query(
            `INSERT INTO user_answers (user_id, session_id, question_index, selected_answer, is_correct, time_taken)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                user_id,
                sessionId,
                questionIndex,
                selectedAnswer,
                isCorrect,
                timeTaken,
            ],
        );

        res.status(200).json({ isCorrect, correctAnswer });
    } catch (error) {
        res.status(500).json({ error: "Error submitting answer" });
    }
};
