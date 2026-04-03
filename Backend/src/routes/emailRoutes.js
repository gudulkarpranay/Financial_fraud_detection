import express from "express";
import { sendFraudAlertEmail } from "../services/emailService.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  const { to, alertData } = req.body;

  if (!to) {
    return res.status(400).json({ error: "Missing recipient email (to)" });
  }
  if (!alertData) {
    return res.status(400).json({ error: "Missing alertData" });
  }

  const success = await sendFraudAlertEmail(to, alertData);

  if (success) {
    res.status(200).json({ message: "Email sent successfully" });
  } else {
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
