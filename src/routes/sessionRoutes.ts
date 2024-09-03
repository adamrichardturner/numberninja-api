import { Router } from "express";
import { createSession, endSession } from "../controllers/sessionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/sessions/create", authMiddleware, createSession);
router.post("/sessions/:sessionId/end", endSession);

export default router;
