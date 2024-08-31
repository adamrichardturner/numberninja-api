import { Router } from "express";
import {
    createSession,
    getModes,
    getOperations,
    getRanges,
    getDifficulties,
    getQuestions,
} from "../controllers/sessionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/sessions/:sessionId/questions", authMiddleware, getQuestions);
router.post("/create", authMiddleware, createSession);
router.get("/modes", authMiddleware, getModes);
router.get("/operations", authMiddleware, getOperations);
router.get("/ranges", authMiddleware, getRanges);
router.get("/difficulties", authMiddleware, getDifficulties);

export default router;
