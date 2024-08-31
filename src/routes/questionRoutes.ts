import { Router } from "express";
import { getQuestions, submitAnswers } from "../controllers/questionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/questions/:sessionId", authMiddleware, getQuestions);
router.post("/submit-answer", authMiddleware, submitAnswers);

export default router;
