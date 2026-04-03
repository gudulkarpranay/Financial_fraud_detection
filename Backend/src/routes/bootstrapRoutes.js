import express from "express";
import { getBootstrapData } from "../controllers/bootstrapController.js";

const router = express.Router();

router.get("/", getBootstrapData);

export default router;

