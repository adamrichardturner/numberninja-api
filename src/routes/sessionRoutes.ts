import { Router } from "express";
import {
    createSession,
    getModes,
    getOperations,
    getRanges,
    getDifficulties,
} from "../controllers/sessionController";

const router = Router();

router.post("/create", createSession);
router.get("/modes", getModes);
router.get("/operations", getOperations);
router.get("/ranges", getRanges);
router.get("/difficulties", getDifficulties);

export default router;
