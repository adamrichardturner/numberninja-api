import { Request, Response } from "express";
import { questionService } from "../services/questionService";

export const getQuestions = async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.sessionId;
        const questions = await questionService.getQuestions(sessionId);
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
        console.log("Received answers:", answers);
        const result = await questionService.submitAnswers(sessionId, answers);
        res.json(result);
    } catch (error) {
        console.error("Error in submitAnswers:", error);
        res.status(500).json({
            error: "Internal server error",
            details: error instanceof Error ? error.message : String(error),
        });
    }
};

export const getSessionResults = async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.sessionId;
        const results = await questionService.getSessionResults(sessionId);
        res.json(results);
    } catch (error) {
        console.error("Error in getSessionResults:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
