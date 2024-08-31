import { Router } from "express";
import {
    getQuestions,
    submitAnswers,
    getSessionResults,
} from "../controllers/questionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/sessions/:sessionId/questions", authMiddleware, getQuestions);
router.post("/sessions/:sessionId/submit", authMiddleware, submitAnswers);
router.get("/sessions/:sessionId/results", authMiddleware, getSessionResults);
export default router;
