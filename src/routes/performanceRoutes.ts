import { Router } from "express";
import {
    getSessionData,
    getOperationPerformance,
    getStrugglingQuestions,
    getTotalStats,
    getPerformanceOverTime,
    getCommonWrongAnswers,
} from "../controllers/performanceController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/performance/session-data", authMiddleware, getSessionData);
router.get(
    "/performance/operation-performance",
    authMiddleware,
    getOperationPerformance,
);
router.get(
    "/performance/struggling-questions",
    authMiddleware,
    getStrugglingQuestions,
);
router.get("/performance/total-stats", authMiddleware, getTotalStats);
router.get(
    "/performance/performance-over-time",
    authMiddleware,
    getPerformanceOverTime,
);
router.get(
    "/performance/common-wrong-answers",
    authMiddleware,
    getCommonWrongAnswers,
);

export default router;
