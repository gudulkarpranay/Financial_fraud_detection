import AnalystFeedback from "../models/AnalystFeedback.js";
import Transaction from "../models/Transaction.js";
import { trainModel } from "../services/aiModel.js";

// 🧠 Convert transaction → features
const extractFeatures = (tx) => [
  tx.amount || 0,
  tx.frequency || 1,
  tx.velocity || 1,
  tx.fromBank !== tx.toBank ? 1 : 0,
  tx.isNewAccount ? 1 : 0,
];

export const submitFeedback = async (req, res) => {
  try {
    const { transactionId, decision, reason } = req.body;

    const tx = await Transaction.findById(transactionId);

    if (!tx) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // 💾 Save feedback
    const feedback = await AnalystFeedback.create({
      transactionId,
      analystDecision: decision,
      reason,
      originalRisk: tx.riskScore,
      corrected: true,
      features: extractFeatures(tx),
      label: decision === "fraud" ? 1 : 0,
    });

    // 🔥 Adaptive correction
    if (decision === "safe") {
      tx.riskScore = Math.max(tx.riskScore - 20, 0);
      tx.isFraud = false;
    } else {
      tx.riskScore = Math.min(tx.riskScore + 20, 100);
      tx.isFraud = true;
    }

    await tx.save();

    // 🧠 Retrain AI model from all feedback
    const allFeedback = await AnalystFeedback.find();

    const data = {
      features: allFeedback.map((f) => f.features),
      labels: allFeedback.map((f) => [f.label]),
    };

    await trainModel(data);

    res.json({
      message: "✅ Feedback recorded + AI model updated",
      feedback,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};