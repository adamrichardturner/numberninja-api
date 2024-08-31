import { Router } from "express";
import { createSession } from "../controllers/sessionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/sessions/create", authMiddleware, createSession);

export default router;
