import express from "express";
import { chatWithSystem } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", chatWithSystem);

export default router;
