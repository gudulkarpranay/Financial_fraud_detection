import Transaction from "../models/Transaction.js";
import { analyzeTransaction } from "../services/fraudDetectionService.js";

export const getFundFlow = async (req, res) => {
  try {
    const { accountId } = req.params;

    let transactions = [];
    try {
      transactions = await Transaction.find({
        $or: [
          { fromAccount: accountId },
          { toAccount: accountId },
        ],
      });
    } catch (dbError) {
      // Demo mode: if DB is unavailable, continue with fallback graph data.
      console.warn("Fund flow DB query failed, switching to fallback demo data.");
    }

    // 🧠 fallback demo data
    if (transactions.length === 0) {
      transactions = [
        { fromAccount: "A1", toAccount: "B1", amount: 50000, timestamp: new Date() },
        { fromAccount: "B1", toAccount: "C1", amount: 120000, timestamp: new Date() },
        { fromAccount: "C1", toAccount: "D1", amount: 80000, timestamp: new Date() },
        { fromAccount: "D1", toAccount: "A1", amount: 90000, timestamp: new Date() },
        { fromAccount: "A1", toAccount: "E1", amount: 30000, timestamp: new Date() },
      ];
    }

    const nodesMap = new Map();
    const edges = [];

    // 🔗 BUILD GRAPH
    for (const tx of transactions) {
      const analysis = await analyzeTransaction(tx, transactions);

      // INIT NODES
      if (!nodesMap.has(tx.fromAccount)) {
        nodesMap.set(tx.fromAccount, {
          id: tx.fromAccount,
          totalRisk: 0,
          count: 0,
          reasons: [],
          balance: 100000,
        });
      }

      if (!nodesMap.has(tx.toAccount)) {
        nodesMap.set(tx.toAccount, {
          id: tx.toAccount,
          totalRisk: 0,
          count: 0,
          reasons: [],
          balance: 100000,
        });
      }

      // UPDATE SENDER
      const sender = nodesMap.get(tx.fromAccount);
      sender.totalRisk += analysis.riskScore;
      sender.count++;
      sender.reasons.push(...analysis.reasons);
      sender.balance -= tx.amount;

      // UPDATE RECEIVER
      const receiver = nodesMap.get(tx.toAccount);
      receiver.balance += tx.amount;

      // 🔥 EDGE
      edges.push({
        id: `${tx.fromAccount}-${tx.toAccount}-${Date.now()}-${Math.random()}`,
        source: tx.fromAccount,
        target: tx.toAccount,
        label: `₹${tx.amount}`,
        animated: analysis.riskScore > 60,
        style: {
          stroke:
            analysis.riskScore > 80
              ? "#ef4444"
              : analysis.riskScore > 50
              ? "#f59e0b"
              : "#999",
          strokeWidth: analysis.riskScore > 60 ? 2.5 : 1.5,
        },
        data: {
          riskScore: analysis.riskScore,
          reasons: analysis.reasons,
        },
      });
    }

    // 🔥 POSITIONING (FIXED — IMPORTANT)
    let index = 0;
    const spacingX = 250; // increased spacing
    const spacingY = 180;

    const nodes = Array.from(nodesMap.values()).map((n) => {
      const avgRisk = n.count ? Math.round(n.totalRisk / n.count) : 0;

      const node = {
        id: n.id,
        type: "accountNode",
        data: {
          account: {
            id: n.id,
            riskScore: avgRisk,
            isSuspicious: avgRisk > 60,
            reasons: [...new Set(n.reasons)].slice(0, 3),

            // ✅ FIXED BALANCE
            balance: Math.max(n.balance, 0),

            type: "Savings",
            country: "India",
          },
        },
        position: {
          x: (index % 3) * spacingX,
          y: Math.floor(index / 3) * spacingY,
        },
      };

      index++;
      return node;
    });

    res.json({
      nodes,
      edges,
    });

  } catch (error) {
    console.error("Fund Flow Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};