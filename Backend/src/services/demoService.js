import { produceTransaction } from "../kafka/producer.js";
import { analyzeTransaction } from "./fraudDetectionService.js";

// 🔥 Demo Accounts
const accounts = ["A1", "A2", "A3", "A4", "A5"];

// 🔥 Random amount generator
const randomAmount = () =>
  Math.floor(Math.random() * 50000) + 5000;

// 🔥 FRAUD PATTERNS (VERY IMPORTANT FOR DEMO)
const generateFraudPatterns = () => {
  return [
    // 🔴 Circular Fraud
    { fromAccount: "A1", toAccount: "A2", amount: randomAmount() },
    { fromAccount: "A2", toAccount: "A3", amount: randomAmount() },
    { fromAccount: "A3", toAccount: "A1", amount: randomAmount() },

    // 🟠 Smurfing
    { fromAccount: "A4", toAccount: "A5", amount: 9000 },
    { fromAccount: "A4", toAccount: "A5", amount: 9500 },
    { fromAccount: "A4", toAccount: "A5", amount: 8700 },

    // 🟡 Large suspicious
    { fromAccount: "A2", toAccount: "A5", amount: 120000 },
  ];
};

// 🔥 MAIN DEMO FUNCTION
export const runDemo = async () => {
  try {
    console.log("🎬 Running Fraud Demo...");

    const transactions = generateFraudPatterns();
    const seenTransactions = [];

    for (const tx of transactions) {
      const transaction = {
        ...tx,
        timestamp: Date.now(),
      };

      seenTransactions.push(transaction);

      // Optional Kafka streaming (if enabled/connected)
      await produceTransaction(transaction);

      // Always emit live fraud alerts for demo UX
      const analysis = await analyzeTransaction(transaction, seenTransactions);
      global.io?.emit("fraud-alert", {
        fromAccount: transaction.fromAccount,
        toAccount: transaction.toAccount,
        amount: transaction.amount,
        riskScore: analysis.riskScore,
        alertLevel: analysis.alertLevel,
        reasons: analysis.reasons || [],
        path: [{ from: transaction.fromAccount, to: transaction.toAccount }],
      });

      console.log("📤 Demo TX:", tx);

      // ⏱ Delay for visualization
      await new Promise((res) => setTimeout(res, 800));
    }

    console.log("✅ Demo Completed");
  } catch (error) {
    console.error("❌ Demo Error:", error);
  }
};