import { Request, Response } from "express";
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

export const getQuestions = async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.sessionId;

        // Fetch session details from the database
        const sessionQuery = "SELECT * FROM sessions WHERE id = $1";
        const sessionResult = await pool.query(sessionQuery, [sessionId]);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: "Session not found" });
        }

        const session = sessionResult.rows[0];
        const { question_count, range_id, operation_id } = session;

        // Map the range_id and operation_id to their corresponding values
        const rangeSelected = rangeMapping[range_id] || 10; // Default to 10 if not found
        const operationSelected = operationMapping[operation_id];

        console.log("operation selected", operationSelected);

        console.log("RANGE", rangeSelected);
        console.log("OPERATION", operationSelected);

        if (!operationSelected) {
            throw new Error(`Invalid operation_id: ${operation_id}`);
        }

        // Generate questions based on session parameters
        const questions = generateQuestions(
            sessionId,
            question_count,
            rangeSelected,
            operationSelected,
        );

        // Return the generated questions
        res.json(questions);
    } catch (error) {
        console.error("Error in getQuestions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const submitAnswers = async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.sessionId;
        const { answers } = req.body;

        // Fetch session details from the database
        const sessionQuery = "SELECT * FROM sessions WHERE id = $1";
        const sessionResult = await pool.query(sessionQuery, [sessionId]);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: "Session not found" });
        }

        const session = sessionResult.rows[0];
        const { range_id, operation_id } = session;

        // Map the range_id and operation_id to their corresponding values
        const range = rangeMapping[range_id] || 10; // Default to 10 if not found
        const operation = operationMapping[operation_id] || "addition"; // Default to addition if not found

        let correctCount = 0;
        let totalTime = 0;

        // Check each answer and update the database
        for (const answer of answers) {
            const { questionIndex, selectedAnswer, timeTaken } = answer;
            const { isCorrect, correctAnswer } = checkAnswer(
                sessionId,
                questionIndex,
                selectedAnswer,
                range,
                operation,
            );

            if (isCorrect) {
                correctCount++;
            }
            totalTime += timeTaken;

            // Insert the answer into the database
            const insertAnswerQuery = `
                INSERT INTO answers (session_id, question_index, user_answer, correct_answer, is_correct, time_taken)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await pool.query(insertAnswerQuery, [
                sessionId,
                questionIndex,
                selectedAnswer,
                correctAnswer,
                isCorrect,
                timeTaken,
            ]);
        }

        // Update the session with the results
        const updateSessionQuery = `
            UPDATE sessions
            SET correct_answers = $1, total_time = $2, completed_at = NOW()
            WHERE id = $3
        `;
        await pool.query(updateSessionQuery, [
            correctCount,
            totalTime,
            sessionId,
        ]);

        // Return the results
        res.json({
            correctAnswers: correctCount,
            totalQuestions: answers.length,
            totalTime,
        });
    } catch (error) {
        console.error("Error in submitAnswers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getSessionResults = async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.sessionId;

        // Fetch session details from the database
        const sessionQuery = "SELECT * FROM sessions WHERE id = $1";
        const sessionResult = await pool.query(sessionQuery, [sessionId]);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: "Session not found" });
        }

        const session = sessionResult.rows[0];

        // Fetch answers for the session
        const answersQuery = "SELECT * FROM answers WHERE session_id = $1";
        const answersResult = await pool.query(answersQuery, [sessionId]);

        // Calculate results
        const totalQuestions = answersResult.rows.length;
        const correctAnswers = answersResult.rows.filter(
            answer => answer.is_correct,
        ).length;
        const wrongAnswers = totalQuestions - correctAnswers;

        // Return the results
        res.json({
            sessionId,
            totalQuestions,
            correctAnswers,
            wrongAnswers,
            totalTime: session.total_time,
        });
    } catch (error) {
        console.error("Error in getSessionResults:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
