import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  fromAccount: String,
  toAccount: String,
  amount: Number,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Transaction", transactionSchema);
