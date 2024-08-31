import { Request, Response } from "express";
import { sessionService } from "../services/sessionService";

import { v5 as uuidv5 } from "uuid";

export const createSession = async (req: Request, res: Response) => {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    // Convert Firebase UID to a UUID
    const UUID_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341"; // You can generate this once and reuse
    const userId = uuidv5(firebaseUid, UUID_NAMESPACE);

    const { mode, difficulty, operation, range } = req.body;

    try {
        const sessionId = await sessionService.createSession(
            userId,
            mode.toLowerCase(),
            difficulty.toLowerCase(),
            operation.toLowerCase(),
            range,
        );
        res.status(201).json({ sessionId });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error creating session:", error.message);
            res.status(400).json({ error: error.message });
        } else {
            console.error("Unexpected error:", error);
            res.status(500).json({ error: "Error creating session" });
        }
    }
};

export const getModes = async (req: Request, res: Response) => {
    try {
        const modes = await sessionService.getModes();
        const formattedModes = modes.map(mode => ({
            id: mode.id,
            name: mode.mode_name.toLowerCase(),
        }));
        res.status(200).json(formattedModes);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching modes:", error.message);
        } else {
            console.error("Unexpected error:", error);
        }
        res.status(500).json({ error: "Error fetching modes" });
    }
};

export const getOperations = async (req: Request, res: Response) => {
    try {
        const operations = await sessionService.getOperations();
        res.status(200).json(operations);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching operations:", error.message);
        } else {
            console.error("Unexpected error:", error);
        }
        res.status(500).json({ error: "Error fetching operations" });
    }
};

export const getRanges = async (req: Request, res: Response) => {
    try {
        const ranges = await sessionService.getRanges();
        res.status(200).json(ranges);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching ranges:", error.message);
        } else {
            console.error("Unexpected error:", error);
        }
        res.status(500).json({ error: "Error fetching ranges" });
    }
};

export const getDifficulties = async (req: Request, res: Response) => {
    try {
        const difficulties = await sessionService.getDifficulties();
        res.status(200).json(difficulties);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching difficulties:", error.message);
        } else {
            console.error("Unexpected error:", error);
        }
        res.status(500).json({ error: "Error fetching difficulties" });
    }
};

export const getQuestions = async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    try {
        const questions = await sessionService.getQuestions(sessionId);
        res.status(200).json(questions);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching questions:", error.message);
        } else {
            console.error("Unexpected error:", error);
        }
        res.status(500).json({ error: "Error fetching questions" });
    }
};
