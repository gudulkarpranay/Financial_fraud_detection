import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  accountId: {
    type: String,
    required: true,
  },
  riskScore: {
    type: Number,
    required: true,
  },
  reasons: [
    {
      type: String,
    },
  ],
  status: {
    type: String,
    enum: ["open", "investigating", "resolved"],
    default: "open",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Alert", alertSchema);