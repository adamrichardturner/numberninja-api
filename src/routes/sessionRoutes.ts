import { Router } from "express";
import { createSession } from "../controllers/sessionController";

const router = Router();

router.post("/create", createSession);

export default router;
