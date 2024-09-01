import { Router } from "express";
import {
    getSessionData,
    getOperationPerformance,
    getStrugglingQuestions,
    getTotalStats,
    getPerformanceOverTime,
} from "../controllers/performanceController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/session-data", authMiddleware, getSessionData);
router.get("/operation-performance", authMiddleware, getOperationPerformance);
router.get("/struggling-questions", authMiddleware, getStrugglingQuestions);
router.get("/total-stats", authMiddleware, getTotalStats);
router.get("/performance-over-time", authMiddleware, getPerformanceOverTime);

export default router;
