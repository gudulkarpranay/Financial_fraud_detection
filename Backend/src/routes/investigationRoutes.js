import express from "express";
import { investigateAccount } from "../controllers/investigationController.js";

const router = express.Router();

router.get("/:accountId", investigateAccount);

export default router;