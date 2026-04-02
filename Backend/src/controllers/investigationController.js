import Transaction from "../models/Transaction.js";


// =====================================================
// 🔍 INVESTIGATION MODE (FIXES YOUR ERROR 🔥)
// =====================================================
export const investigateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    let transactions = await Transaction.find();

    // fallback demo data
    if (transactions.length === 0) {
      transactions = [
        { fromAccount: "A1", toAccount: "B1" },
        { fromAccount: "B1", toAccount: "C1" },
        { fromAccount: "C1", toAccount: "A1" }, // cycle
        { fromAccount: "A1", toAccount: "D1" },
        { fromAccount: "D1", toAccount: "E1" },
      ];
    }

    // 🔗 build adjacency
    const adj = {};
    transactions.forEach((tx) => {
      if (!adj[tx.fromAccount]) adj[tx.fromAccount] = [];
      adj[tx.fromAccount].push(tx.toAccount);
    });

    // 🔍 DFS path finder
    const findPaths = (start, visited = new Set(), path = [], depth = 0) => {
      if (depth > 5) return [];

      visited.add(start);
      path.push(start);

      let paths = [];

      for (let neighbor of adj[start] || []) {
        if (!visited.has(neighbor)) {
          paths.push(
            ...findPaths(neighbor, new Set(visited), [...path], depth + 1)
          );
        } else {
          // cycle detected
          paths.push([...path, neighbor]);
        }
      }

      return paths;
    };

    const allPaths = findPaths(accountId);
    const suspiciousPaths = allPaths.filter((p) => p.length > 2);

    res.json({
      accountId,
      suspiciousPaths,
      summary: {
        hasCycle: suspiciousPaths.some(
          (p) => p[0] === p[p.length - 1]
        ),
        pathCount: suspiciousPaths.length,
      },
    });

  } catch (err) {
    console.error("Investigation Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// =====================================================
// 🔗 FUND FLOW GRAPH (YOUR FINAL UPGRADED ENGINE 🔥)
// =====================================================
export const getFundFlow = async (req, res) => {
  try {
    const { accountId } = req.params;

    let transactions = await Transaction.find({
      $or: [
        { fromAccount: accountId },
        { toAccount: accountId },
      ],
    });

    const nodes = new Set();
    const edges = [];

    // 🧠 Dummy fallback
    if (transactions.length === 0) {
      transactions = [
        { fromAccount: "A1", toAccount: "B1", amount: 50000, timestamp: new Date() },
        { fromAccount: "B1", toAccount: "C1", amount: 120000, timestamp: new Date() },
        { fromAccount: "C1", toAccount: "D1", amount: 80000, timestamp: new Date() },
        { fromAccount: "D1", toAccount: "A1", amount: 90000, timestamp: new Date() },
        { fromAccount: "A1", toAccount: "E1", amount: 30000, timestamp: new Date() },
      ];
    }

    const now = Date.now();

    // 🔗 EDGE BUILDING
    transactions.forEach((tx) => {
      nodes.add(tx.fromAccount);
      nodes.add(tx.toAccount);

      let edgeRisk = 0;
      let edgeReasons = [];

      if (tx.amount > 100000) {
        edgeRisk += 30;
        edgeReasons.push("High-value");
      }

      const recentTx = transactions.filter(
        (t) =>
          t.fromAccount === tx.fromAccount &&
          now - new Date(t.timestamp).getTime() < 5 * 60 * 1000
      );

      if (recentTx.length > 3) {
        edgeRisk += 20;
        edgeReasons.push("Rapid transfers");
      }

      edges.push({
        id: `${tx.fromAccount}-${tx.toAccount}-${Math.random()}`,
        source: tx.fromAccount,
        target: tx.toAccount,
        label: `₹${tx.amount}`,
        animated: edgeRisk > 60,
        style: {
          stroke:
            edgeRisk > 80
              ? "red"
              : edgeRisk > 50
              ? "orange"
              : "#999",
          strokeWidth: edgeRisk > 60 ? 3 : 1.5,
        },
        data: {
          riskScore: edgeRisk,
          reasons: edgeReasons,
        },
      });
    });

    // 🧠 NODE FRAUD ENGINE
    const graphNodes = [...nodes].map((id) => {
      const relatedTx = transactions.filter(
        (tx) => tx.fromAccount === id || tx.toAccount === id
      );

      let riskScore = 0;
      let reasons = [];

      // 🔴 High value
      if (relatedTx.some((tx) => tx.amount > 100000)) {
        riskScore += 30;
        reasons.push("High-value transaction");
      }

      // 🔴 Frequent
      if (relatedTx.length > 3) {
        riskScore += 25;
        reasons.push("Frequent transactions");
      }

      // 📊 Behavior
      const sentTx = relatedTx.filter((tx) => tx.fromAccount === id);
      const avg =
        sentTx.reduce((s, tx) => s + tx.amount, 0) /
        (sentTx.length || 1);

      if (sentTx.some((tx) => tx.amount > avg * 3 && avg > 0)) {
        riskScore += 25;
        reasons.push("Behavior deviation");
      }

      // 🔗 Circular
      const isCircular = transactions.some(
        (t1) =>
          transactions.some(
            (t2) =>
              t1.fromAccount === id &&
              t2.toAccount === id &&
              t1.toAccount === t2.fromAccount
          )
      );

      if (isCircular) {
        riskScore += 40;
        reasons.push("Circular pattern");
      }

      // 🔗 Fan-out
      const receivers = new Set(
        transactions
          .filter((tx) => tx.fromAccount === id)
          .map((tx) => tx.toAccount)
      );

      if (receivers.size > 3) {
        riskScore += 35;
        reasons.push("Fan-out burst");
      }

      // ⏳ Time decay
      const latest = Math.max(
        ...relatedTx.map((t) => new Date(t.timestamp).getTime())
      );

      const decay = Math.exp(-(now - latest) / (5 * 60 * 1000));
      riskScore = riskScore * decay;

      riskScore = Math.min(Math.round(riskScore), 100);

      return {
        id,
        type: "accountNode",
        data: {
          account: {
            id,
            riskScore,
            isSuspicious: riskScore > 60,
            reasons: [...new Set(reasons)].slice(0, 4),
          },
        },
        position: {
          x: Math.random() * 600,
          y: Math.random() * 400,
        },
      };
    });

    res.json({ nodes: graphNodes, edges });

  } catch (error) {
    console.error("Fund Flow Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};