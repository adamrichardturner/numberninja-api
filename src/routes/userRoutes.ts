import express from "express";
import { deleteUserData } from "../controllers/userController";
import { firebaseAuth } from "../middleware/firebaseAuth";

const router = express.Router();

router.delete("/delete-account", firebaseAuth, deleteUserData);

export default router;
