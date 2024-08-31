import { Router } from "express";
import {
    getQuestions,
    submitAnswers,
    getSessionResults,
} from "../controllers/questionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/questions/:sessionId/questions", authMiddleware, getQuestions);
router.post("/questions/:sessionId/submit", authMiddleware, submitAnswers);
router.get("/question/:sessionId/results", authMiddleware, getSessionResults);

export default router;
