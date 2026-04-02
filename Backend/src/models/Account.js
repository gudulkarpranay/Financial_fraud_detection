import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  accountId: String,
  name: String,
  riskScore: { type: Number, default: 0 },
  isSuspicious: { type: Boolean, default: false },
});

export default mongoose.model("Account", accountSchema);
