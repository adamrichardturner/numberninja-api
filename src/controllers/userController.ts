import { Request, Response } from "express";
import { userService } from "../services/userService";
import { v5 as uuidv5 } from "uuid";

const UUID_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

export const deleteUserData = async (req: Request, res: Response) => {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = uuidv5(firebaseUid, UUID_NAMESPACE);

    try {
        await userService.deleteUserData(userId);
        res.status(200).json({ message: "User data deleted successfully" });
    } catch (error) {
        console.error("Error deleting user data:", error);
        res.status(500).json({ message: "Error deleting user data" });
    }
};
