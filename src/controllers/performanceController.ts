import { Request, Response } from "express";
import { performanceService } from "../services/performanceService";
import { v5 as uuidv5 } from "uuid";

const UUID_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

export const getSessionData = async (req: Request, res: Response) => {
    try {
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = uuidv5(firebaseUid, UUID_NAMESPACE);

        const sessionData = await performanceService.getSessionData(userId);

        res.json(sessionData);
    } catch (error) {
        console.error("Error fetching session data:", error);
        res.status(500).json({ error: "Failed to fetch session data" });
    }
};

export const getOperationPerformance = async (req: Request, res: Response) => {
    try {
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = uuidv5(firebaseUid, UUID_NAMESPACE);

        const operationPerformance =
            await performanceService.getOperationPerformance(userId);

        res.json(operationPerformance);
    } catch (error) {
        console.error("Error fetching operation performance:", error);
        res.status(500).json({
            error: "Failed to fetch operation performance",
        });
    }
};

export const getStrugglingQuestions = async (req: Request, res: Response) => {
    try {
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = uuidv5(firebaseUid, UUID_NAMESPACE);
        const { operation } = req.query;

        if (!operation) {
            return res.status(400).json({ error: "Operation is required" });
        }

        const strugglingQuestions =
            await performanceService.getStrugglingQuestions(
                userId,
                operation as string,
            );

        res.json(strugglingQuestions);
    } catch (error) {
        console.error("Error fetching struggling questions:", error);
        res.status(500).json({ error: "Failed to fetch struggling questions" });
    }
};

export const getTotalStats = async (req: Request, res: Response) => {
    try {
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = uuidv5(firebaseUid, UUID_NAMESPACE);

        const totalStats = await performanceService.getTotalStats(userId);

        res.json(totalStats);
    } catch (error) {
        console.error("Error fetching total stats:", error);
        res.status(500).json({ error: "Failed to fetch total stats" });
    }
};

export const getPerformanceOverTime = async (req: Request, res: Response) => {
    try {
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = uuidv5(firebaseUid, UUID_NAMESPACE);

        const performanceOverTime =
            await performanceService.getPerformanceOverTime(userId);

        res.json(performanceOverTime);
    } catch (error) {
        console.error("Error fetching performance over time:", error);
        res.status(500).json({
            error: "Failed to fetch performance over time",
        });
    }
};

export const getCommonWrongAnswers = async (req: Request, res: Response) => {
    try {
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = uuidv5(firebaseUid, UUID_NAMESPACE);
        const limit = req.query.limit
            ? parseInt(req.query.limit as string)
            : 20;

        const commonWrongAnswers =
            await performanceService.getCommonWrongAnswers(userId, limit);

        res.json(commonWrongAnswers);
    } catch (error) {
        console.error("Error fetching common wrong answers:", error);
        res.status(500).json({ error: "Failed to fetch common wrong answers" });
    }
};
