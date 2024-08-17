import { Router } from "express";
import { getQuestions, submitAnswer } from "../controllers/questionController";

const router = Router();

router.get("/:sessionId", getQuestions);
router.post("/submit", submitAnswer);

export default router;
