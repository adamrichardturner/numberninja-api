import { Router } from "express";
import {
    getSessionData,
    getOperationPerformance,
    getTotalStats,
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
router.get("/performance/total-stats", authMiddleware, getTotalStats);
router.get(
    "/performance/common-wrong-answers",
    authMiddleware,
    getCommonWrongAnswers,
);

export default router;
