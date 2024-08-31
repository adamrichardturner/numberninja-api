import { Router } from "express";
import {
    getSessionData,
    getOperationPerformance,
    getCommonWrongAnswers,
} from "../controllers/performanceController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/session-data", authMiddleware, getSessionData);
router.get("/operation-performance", authMiddleware, getOperationPerformance);
router.get("/common-wrong-answers", authMiddleware, getCommonWrongAnswers);

export default router;
