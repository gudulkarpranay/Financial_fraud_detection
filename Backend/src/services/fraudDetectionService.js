import { predictFraud } from "./aiModel.js";

// ================= GRAPH STATE =================
const graph = {
  nodes: {},
  adjacencyList: {},
};

function initNode(id) {
  return {
    id,
    totalSent: 0,
    totalReceived: 0,
    inDegree: 0,
    outDegree: 0,
    lastActive: null,
    transactions: [],
    avgAmount: 0,
  };
}

// ================= UPDATE GRAPH =================
function updateGraph(tx) {
  const { fromAccount, toAccount, amount } = tx;

  if (!graph.nodes[fromAccount]) graph.nodes[fromAccount] = initNode(fromAccount);
  if (!graph.nodes[toAccount]) graph.nodes[toAccount] = initNode(toAccount);

  const sender = graph.nodes[fromAccount];
  const receiver = graph.nodes[toAccount];

  sender.totalSent += amount;
  sender.outDegree++;
  sender.transactions.push(tx);
  sender.avgAmount = sender.totalSent / sender.outDegree;

  receiver.totalReceived += amount;
  receiver.inDegree++;
  receiver.transactions.push(tx);

  if (!graph.adjacencyList[fromAccount]) {
    graph.adjacencyList[fromAccount] = [];
  }

  graph.adjacencyList[fromAccount].push(toAccount);
}

// ================= CYCLE DETECTION =================
function hasCycle(start, target, visited = new Set(), depth = 0) {
  if (depth > 4) return false;
  if (!graph.adjacencyList[start]) return false;

  for (let neighbor of graph.adjacencyList[start]) {
    if (neighbor === target && depth >= 1) return true;

    if (!visited.has(neighbor)) {
      visited.add(neighbor);
      if (hasCycle(neighbor, target, visited, depth + 1)) return true;
    }
  }
  return false;
}

// ================= MAIN ENGINE =================
export const analyzeTransaction = async (tx, allTransactions = []) => {
  const now = Date.now();
  const txTime = new Date(tx.timestamp).getTime();

  updateGraph(tx);

  let reasons = [];

  let ruleScore = 0;
  let behaviorScore = 0;
  let graphScore = 0;
  let anomalyScore = 0;

  const node = graph.nodes[tx.fromAccount];

  // ================= RULE ENGINE =================
  if (tx.amount > 100000) {
    ruleScore += 30;
    reasons.push("High-value transaction");
  }

  const recentTx = allTransactions.filter(
    (t) =>
      t.fromAccount === tx.fromAccount &&
      now - new Date(t.timestamp).getTime() < 5 * 60 * 1000
  );

  if (recentTx.length > 3) {
    ruleScore += 25;
    reasons.push("Rapid transactions burst");
  }

  // ================= GRAPH ENGINE =================
  if (hasCycle(tx.toAccount, tx.fromAccount)) {
    graphScore += 40;
    reasons.push("Circular fund movement detected");
  }

  const layering = allTransactions.some(
    (t1) =>
      t1.fromAccount === tx.fromAccount &&
      allTransactions.some(
        (t2) =>
          t2.fromAccount === t1.toAccount &&
          t2.toAccount !== tx.fromAccount &&
          now - new Date(t2.timestamp).getTime() < 10 * 60 * 1000
      )
  );

  if (layering) {
    graphScore += 25;
    reasons.push("Layering pattern detected");
  }

  const receivers = new Set(recentTx.map((t) => t.toAccount));

  if (receivers.size >= 5) {
    graphScore += 35;
    reasons.push("Rapid fan-out burst");
  }

  // ================= BEHAVIOR =================
  const smallTx = recentTx.filter((t) => t.amount < 10000);

  if (smallTx.length >= 5) {
    behaviorScore += 35;
    reasons.push("Smurfing pattern detected");
  }

  if (
    node.lastActive &&
    txTime - new Date(node.lastActive).getTime() > 60 * 60 * 1000
  ) {
    behaviorScore += 30;
    reasons.push("Sleeper account activated");
  }

  node.lastActive = tx.timestamp;

  if (node.avgAmount > 0 && tx.amount > node.avgAmount * 4) {
    anomalyScore += 30;
    reasons.push("Adversarial behavior drift detected");
  }

  // ================= GEO =================
  if (tx.fromBank && tx.toBank && tx.fromBank !== tx.toBank) {
    anomalyScore += 15;
    reasons.push("Cross-bank anomaly");
  }

  const corridorKey = `${tx.fromCountry}-${tx.toCountry}`;

  const corridorTx = allTransactions.filter(
    (t) =>
      `${t.fromCountry}-${t.toCountry}` === corridorKey &&
      now - new Date(t.timestamp).getTime() < 10 * 60 * 1000
  );

  if (corridorTx.length > 5) {
    anomalyScore += 25;
    reasons.push("Corridor evasion pattern");
  }

  // ================= RULE SCORE =================
  let ruleBasedScore =
    0.3 * ruleScore +
    0.25 * behaviorScore +
    0.25 * graphScore +
    0.2 * anomalyScore;

  // ================= AI MODEL =================
  const mlScore = predictFraud([
    tx.amount || 0,
    recentTx.length || 1,
    node.outDegree || 1,
    tx.fromBank !== tx.toBank ? 1 : 0,
    node.avgAmount === 0 ? 1 : 0,
  ]);

  // ================= HYBRID FUSION =================
  let finalScore = Math.round(
    0.6 * ruleBasedScore + 0.4 * mlScore * 100
  );

  // Time decay
  const decay = Math.exp(-(now - txTime) / (5 * 60 * 1000));
  finalScore *= decay;

  finalScore = Math.min(Math.round(finalScore), 100);

  // ================= ALERT =================
  let alertLevel = "SAFE";
  if (finalScore > 80) alertLevel = "BLOCK";
  else if (finalScore > 60) alertLevel = "INVESTIGATE";
  else if (finalScore > 40) alertLevel = "WATCH";

  return {
    riskScore: finalScore,
    aiScore: Math.round(mlScore * 100),
    isFraud: finalScore > 60,
    alertLevel,
    reasons,
  };
};