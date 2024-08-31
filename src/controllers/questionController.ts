import { Request, Response } from "express";
import { validate as isUuid } from "uuid";
import { generateQuestions, checkAnswer } from "../utils/questionGenerator";
import pool from "../config/database";

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

export const getQuestions = async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    try {
        // Fetch questions for the given sessionId
        const result = await pool.query(
            "SELECT * FROM questions WHERE session_id = $1",
            [sessionId],
        );
        res.status(200).json(result.rows);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching questions:", error.message);
        } else {
            console.error("Unexpected error:", error);
        }
        res.status(500).json({ error: "Error fetching questions" });
    }
};

export const submitAnswers = async (req: Request, res: Response) => {
    const { sessionId, answers } = req.body;

    if (!isUuid(sessionId)) {
        return res.status(400).json({ error: "Invalid session ID format" });
    }

    if (!Array.isArray(answers)) {
        return res.status(400).json({ error: "Answers must be an array" });
    }

    try {
        const session = await pool.query(
            "SELECT * FROM sessions WHERE id = $1",
            [sessionId],
        );

        if (!session.rows.length) {
            return res.status(404).json({ error: "Session not found" });
        }

        const { user_id, operation_id, range_id } = session.rows[0];

        // Map operation_id to operation name
        const operationName = operationMapping[operation_id];
        if (!operationName) {
            return res.status(400).json({ error: "Invalid operation ID" });
        }

        // Map range_id to numeric range
        const range = rangeMapping[range_id];
        if (!range) {
            return res.status(400).json({ error: "Invalid range ID" });
        }

        const results = [];

        for (const answer of answers) {
            const { questionIndex, selectedAnswer, timeTaken } = answer;

            const { isCorrect, correctAnswer } = checkAnswer(
                sessionId,
                questionIndex,
                selectedAnswer,
                range,
                operationName,
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

            results.push({ questionIndex, isCorrect, correctAnswer });
        }

        res.status(200).json({ results });
    } catch (error) {
        console.error("Error submitting answers:", error);
        res.status(500).json({ error: "Error submitting answers" });
    }
};
