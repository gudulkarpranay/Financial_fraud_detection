import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  transactionId: String,
  analystDecision: String, // "fraud" | "safe"
  reason: String,
  originalRisk: Number,
  corrected: Boolean,
}, { timestamps: true });

export default mongoose.model("AnalystFeedback", feedbackSchema);