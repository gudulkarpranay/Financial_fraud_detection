import { produceTransaction } from "../kafka/producer.js";
import { analyzeTransaction } from "./fraudDetectionService.js";

const nowIso = (offsetMs = 0) => new Date(Date.now() + offsetMs).toISOString();
const randomAmount = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const deriveAlertLevel = (score) => {
  if (score > 80) return "BLOCK";
  if (score > 60) return "INVESTIGATE";
  if (score > 40) return "WATCH";
  return "SAFE";
};

// Mix normal + fraudulent transactions so demo visibly shows both.
const generateDemoTransactions = () => {
  const normal = [
    {
      scenario: "normal",
      fromAccount: "ACC001",
      toAccount: "ACC006",
      amount: randomAmount(1800, 9500),
      fromBank: "SBI",
      toBank: "SBI",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      scenario: "normal",
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
      scenario: "fraud",
      forcedRisk: 86,
      forcedReason: "Circular movement pattern",
      fromAccount: "ACC002",
      toAccount: "ACC003",
      amount: randomAmount(185000, 325000),
      fromBank: "ICICI",
      toBank: "AXIS",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      scenario: "fraud",
      forcedRisk: 84,
      forcedReason: "Layering hop in circular path",
      fromAccount: "ACC003",
      toAccount: "ACC005",
      amount: randomAmount(170000, 300000),
      fromBank: "HDFC",
      toBank: "KOTAK",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      scenario: "fraud",
      forcedRisk: 89,
      forcedReason: "Funds returning to source account",
      fromAccount: "ACC005",
      toAccount: "ACC002",
      amount: randomAmount(165000, 280000),
      fromBank: "PNB",
      toBank: "ICICI",
      fromCountry: "IN",
      toCountry: "IN",
    },
    // Smurfing burst
    {
      scenario: "fraud",
      forcedRisk: 72,
      forcedReason: "Structuring just below threshold",
      fromAccount: "ACC007",
      toAccount: "ACC008",
      amount: 9200,
      fromBank: "SBI",
      toBank: "HDFC",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      scenario: "fraud",
      forcedRisk: 74,
      forcedReason: "Repeated sub-threshold split",
      fromAccount: "ACC007",
      toAccount: "ACC006",
      amount: 9600,
      fromBank: "SBI",
      toBank: "ICICI",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      scenario: "fraud",
      forcedRisk: 73,
      forcedReason: "Smurfing burst detected",
      fromAccount: "ACC007",
      toAccount: "ACC005",
      amount: 8800,
      fromBank: "SBI",
      toBank: "AXIS",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      scenario: "fraud",
      forcedRisk: 75,
      forcedReason: "Multiple beneficiaries in minutes",
      fromAccount: "ACC007",
      toAccount: "ACC004",
      amount: 9100,
      fromBank: "SBI",
      toBank: "KOTAK",
      fromCountry: "IN",
      toCountry: "IN",
    },
    {
      scenario: "fraud",
      forcedRisk: 78,
      forcedReason: "Fan-out transfer behavior",
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
      scenario: "fraud",
      forcedRisk: 95,
      forcedReason: "Cross-border high-value anomaly",
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

      const isFraudScenario = transaction.scenario === "fraud";
      const effectiveRisk = isFraudScenario
        ? Math.max(analysis.riskScore, transaction.forcedRisk || 75)
        : Math.min(analysis.riskScore, 35);
      const effectiveLevel = deriveAlertLevel(effectiveRisk);
      const effectiveReasons = [
        ...(analysis.reasons || []),
        ...(transaction.forcedReason ? [transaction.forcedReason] : []),
      ];

      global.io?.emit("fraud-alert", {
        fromAccount: transaction.fromAccount,
        toAccount: transaction.toAccount,
        amount: transaction.amount,
        riskScore: effectiveRisk,
        alertLevel: effectiveLevel,
        reasons: [...new Set(effectiveReasons)].slice(0, 4),
        path: [{ from: transaction.fromAccount, to: transaction.toAccount }],
      });

      console.log("📤 Demo TX:", transaction, "=>", effectiveLevel, effectiveRisk);
      await wait(700);
    }

    console.log("✅ Demo Completed");
  } catch (error) {
    console.error("❌ Demo Error:", error);
  }
};