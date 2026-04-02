import express from "express";
import { runDemo } from "../services/demoService.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  try {
    await runDemo();
    res.json({ message: "🚀 Demo started successfully" });
  } catch (error) {
    console.error("Demo error:", error);
    res.status(500).json({ error: "Demo failed" });
  }
});

export default router;