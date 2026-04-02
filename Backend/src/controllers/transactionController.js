import Transaction from "../models/Transaction.js";
import { analyzeTransaction } from "../services/fraudDetectionService.js";
import { produceTransaction } from "../kafka/producer.js";

// ------------------ CREATE TRANSACTION ------------------
export const createTransaction = async (req, res) => {
  try {
    const txData = req.body;

    // 🔥 1. Send to Kafka (REAL-TIME PIPELINE)
    try {
      await produceTransaction(txData);
    } catch (err) {
      console.warn("⚠️ Kafka send failed (continuing):", err.message);
    }

    // 🔥 2. Fetch historical transactions
    const allTransactions = await Transaction.find();

    // 🧠 3. Run fraud detection
    const analysis = await analyzeTransaction(txData, allTransactions);

    // 💾 4. Save in DB
    const tx = await Transaction.create({
      ...txData,
      riskScore: analysis.riskScore,
      isFraud: analysis.isFraud,
      reasons: analysis.reasons,
      alertLevel: analysis.alertLevel,
    });

    // ⚡ 5. REAL-TIME ALERT (ENHANCED FOR GRAPH 🔥)
    if (analysis.riskScore > 40 && global.io) {
      global.io.emit("fraud-alert", {
        transaction: tx,
        analysis,

        // 🔥 ADD THIS → used by frontend graph highlight
        path: [
          {
            from: tx.fromAccount,
            to: tx.toAccount,
            amount: tx.amount,
            reason: analysis.reasons?.[0] || "Suspicious pattern",
          },
        ],
      });
    }

    res.status(201).json({
      transaction: tx,
      fraudAnalysis: analysis,
      message: "Transaction processed + sent to Kafka",
    });
  } catch (err) {
    console.error("❌ Transaction Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------ GET ALL TRANSACTIONS ------------------
export const getTransactions = async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    console.error("❌ Fetch Transactions Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------ FUND FLOW GRAPH ------------------
export const getFundFlow = async (req, res) => {
  try {
    const { accountId } = req.params;

    let transactions = await Transaction.find({
      $or: [
        { fromAccount: accountId },
        { toAccount: accountId },
      ],
    });

    // 🧠 Demo fallback
    if (transactions.length === 0) {
      transactions = [
        { fromAccount: "A1", toAccount: "B1", amount: 50000 },
        { fromAccount: "B1", toAccount: "C1", amount: 120000 },
        { fromAccount: "C1", toAccount: "D1", amount: 80000 },
        { fromAccount: "D1", toAccount: "A1", amount: 90000 },
        { fromAccount: "A1", toAccount: "E1", amount: 30000 },
      ];
    }

    const nodes = new Map();
    const edges = [];

    // ------------------ BUILD GRAPH ------------------
    for (const tx of transactions) {
      const analysis = await analyzeTransaction(tx, transactions);

      // NODE INIT
      if (!nodes.has(tx.fromAccount)) {
        nodes.set(tx.fromAccount, {
          id: tx.fromAccount,
          totalRisk: 0,
          txCount: 0,
          reasons: [],
        });
      }

      if (!nodes.has(tx.toAccount)) {
        nodes.set(tx.toAccount, {
          id: tx.toAccount,
          totalRisk: 0,
          txCount: 0,
          reasons: [],
        });
      }

      // UPDATE NODE
      const senderNode = nodes.get(tx.fromAccount);
      senderNode.totalRisk += analysis.riskScore;
      senderNode.txCount += 1;
      senderNode.reasons.push(...analysis.reasons);

      // EDGE
      edges.push({
        id: `${tx.fromAccount}-${tx.toAccount}-${Math.random()}`,
        source: tx.fromAccount,
        target: tx.toAccount,
        label: `₹${tx.amount}`,

        animated: analysis.riskScore > 60,

        markerEnd: {
          type: "arrowclosed",
        },

        style: {
          stroke:
            analysis.riskScore > 80
              ? "red"
              : analysis.riskScore > 50
              ? "orange"
              : "#999",
          strokeWidth: analysis.riskScore > 70 ? 3 : 1.5,
        },

        data: {
          riskScore: analysis.riskScore,
          reasons: analysis.reasons,
          alertLevel: analysis.alertLevel,
        },
      });
    }

    // ---------------- FINAL NODE FORMAT ----------------
    const graphNodes = Array.from(nodes.values()).map((node) => {
      const avgRisk =
        node.txCount > 0
          ? Math.round(node.totalRisk / node.txCount)
          : 0;

      return {
        id: node.id,
        type: "accountNode",

        data: {
          account: {
            id: node.id,
            riskScore: avgRisk,
            isSuspicious: avgRisk > 60,
            reasons: [...new Set(node.reasons)].slice(0, 3),
            balance: Math.floor(Math.random() * 100000), // demo enhancement
            country: "IN",
          },
        },

        position: {
          x: Math.random() * 600,
          y: Math.random() * 400,
        },
      };
    });

    res.json({
      nodes: graphNodes,
      edges,
    });

  } catch (error) {
    console.error("❌ Fund Flow Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};