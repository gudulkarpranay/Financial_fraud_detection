import { produceTransaction } from "../kafka/producer.js";
import { analyzeTransaction } from "./fraudDetectionService.js";

const nowIso = (offsetMs = 0) => new Date(Date.now() + offsetMs).toISOString();
const randomAmount = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Mix normal + fraudulent transactions so demo visibly shows both.
const generateDemoTransactions = () => {
  const normal = [
    {
      fromAccount: "ACC001",
      toAccount: "ACC006",
      amount: randomAmount(1800, 9500),
      fromBank: "SBI",
      toBank: "SBI",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      fromAccount: "ACC003",
      toAccount: "ACC004",
      amount: randomAmount(12000, 32000),
      fromBank: "HDFC",
      toBank: "HDFC",
      fromCountry: "IN",
      toCountry: "IN",
    },
  ];

  const fraudulent = [
    // Circular sequence
    {
      fromAccount: "ACC002",
      toAccount: "ACC003",
      amount: randomAmount(85000, 125000),
      fromBank: "ICICI",
      toBank: "AXIS",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      fromAccount: "ACC003",
      toAccount: "ACC005",
      amount: randomAmount(78000, 118000),
      fromBank: "HDFC",
      toBank: "KOTAK",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      fromAccount: "ACC005",
      toAccount: "ACC002",
      amount: randomAmount(75000, 110000),
      fromBank: "PNB",
      toBank: "ICICI",
      fromCountry: "IN",
      toCountry: "IN",
    },
    // Smurfing burst
    {
      fromAccount: "ACC007",
      toAccount: "ACC008",
      amount: 9200,
      fromBank: "SBI",
      toBank: "HDFC",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      fromAccount: "ACC007",
      toAccount: "ACC006",
      amount: 9600,
      fromBank: "SBI",
      toBank: "ICICI",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      fromAccount: "ACC007",
      toAccount: "ACC005",
      amount: 8800,
      fromBank: "SBI",
      toBank: "AXIS",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      fromAccount: "ACC007",
      toAccount: "ACC004",
      amount: 9100,
      fromBank: "SBI",
      toBank: "KOTAK",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      fromAccount: "ACC007",
      toAccount: "ACC003",
      amount: 9700,
      fromBank: "SBI",
      toBank: "PNB",
      fromCountry: "IN",
      toCountry: "IN",
    },
    // Cross-border high risk
    {
      fromAccount: "ACC008",
      toAccount: "ACC001",
      amount: randomAmount(140000, 260000),
      fromBank: "ICICI",
      toBank: "SBI",
      fromCountry: "RU",
      toCountry: "IN",
    },
  ];

  return [...normal, ...fraudulent];
};

export const runDemo = async () => {
  try {
    console.log("🎬 Running Fraud Demo...");

    const transactions = generateDemoTransactions();
    const seenTransactions = [];

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      const transaction = {
        ...tx,
        timestamp: nowIso(i * 1200),
      };

      seenTransactions.push(transaction);
      await produceTransaction(transaction);

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

      console.log("📤 Demo TX:", transaction, "=>", analysis.alertLevel, analysis.riskScore);
      await new Promise((res) => setTimeout(res, 700));
    }

    console.log("✅ Demo Completed");
  } catch (error) {
    console.error("❌ Demo Error:", error);
  }
};