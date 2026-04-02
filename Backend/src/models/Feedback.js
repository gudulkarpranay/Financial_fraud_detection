import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    transaction: Object,
    isFraud: Boolean,
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
