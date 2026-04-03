/** Static bootstrap dataset served at GET /api/bootstrap — single source for the frontend when DB is empty. */

const ACCOUNT_DETAILS = [
  { name: "Ananya Kulkarni", bank: "State Bank of India", ifsc: "SBIN0000123", city: "Mumbai", state: "Maharashtra", pan: "ABKPR1234K", phone: "9876543210", ipAddress: "103.21.45.67", email: "ananya.k@email.in" },
  { name: "Rahul Verma", bank: "ICICI Bank", ifsc: "ICIC0000456", city: "Delhi", state: "Delhi", pan: "BCKPV2345L", phone: "9811122334", ipAddress: "106.51.22.10", email: "rahul.v@email.in" },
  { name: "Neha Gupta", bank: "HDFC Bank", ifsc: "HDFC0000789", city: "Bengaluru", state: "Karnataka", pan: "CDRGS3456M", phone: "9822334455", ipAddress: "49.205.77.88", email: "neha.g@email.in" },
  { name: "Rohit Sharma", bank: "Axis Bank", ifsc: "UTIB0000198", city: "Hyderabad", state: "Telangana", pan: "EFTRS4567N", phone: "9900112233", ipAddress: "182.71.14.39", email: "rohit.s@email.in" },
  { name: "Priya Nair", bank: "Punjab National Bank", ifsc: "PUNB0000333", city: "Chennai", state: "Tamil Nadu", pan: "GHIEN5678P", phone: "9344556677", ipAddress: "120.63.190.55", email: "priya.n@email.in" },
  { name: "Sharma Exports Pvt Ltd", bank: "State Bank of India", ifsc: "SBIN0000999", city: "Pune", state: "Maharashtra", pan: "AABCS1234K", phone: "9765432109", ipAddress: "103.17.2.44", email: "exports@sharma.in" },
  { name: "Patel Holdings", bank: "HDFC Bank", ifsc: "HDFC0000222", city: "Ahmedabad", state: "Gujarat", pan: "AAZHP5678Q", phone: "9898981212", ipAddress: "122.160.88.101", email: "holdings@patel.in" },
  { name: "Mehta Trade LLP", bank: "ICICI Bank", ifsc: "ICIC0000550", city: "Kolkata", state: "West Bengal", pan: "AAKFN9012R", phone: "9911223344", ipAddress: "103.55.61.9", email: "trade@mehta.in" },
  { name: "Reddy Ventures", bank: "Axis Bank", ifsc: "UTIB0000777", city: "Lucknow", state: "Uttar Pradesh", pan: "AAZCR3456S", phone: "9123456789", ipAddress: "14.139.221.72", email: "ventures@reddy.in" },
  { name: "Anurag Singh & Co.", bank: "Kotak Mahindra Bank", ifsc: "KKBK0000101", city: "Jaipur", state: "Rajasthan", pan: "ACNPS7788T", phone: "9000012345", ipAddress: "180.95.44.18", email: "anurag@asc.in" },
  { name: "Cascade Investments India", bank: "Canara Bank", ifsc: "CNRB0000202", city: "Nagpur", state: "Maharashtra", pan: "AAQCC2345U", phone: "9812345678", ipAddress: "49.206.10.2", email: "cascade@inv.in" },
  { name: "Final Route Consultants", bank: "IndusInd Bank", ifsc: "INDB0000331", city: "Chandigarh", state: "Chandigarh", pan: "AARHF9012V", phone: "9870098765", ipAddress: "103.2.17.199", email: "final@route.in" },
  { name: "Patel Holdings (Shell)", bank: "HDFC Bank", ifsc: "HDFC0007771", city: "Delhi", state: "Delhi", pan: "AAAPL1234C", phone: "9890011122", ipAddress: "41.66.12.250", email: "shell1@offshore.io" },
  { name: "Mehta Trade (Shell)", bank: "ICICI Bank", ifsc: "ICIC0007772", city: "Bengaluru", state: "Karnataka", pan: "AABCK5678D", phone: "9988007766", ipAddress: "38.120.90.41", email: "shell2@offshore.io" },
  { name: "Reddy Ventures (Shell)", bank: "Axis Bank", ifsc: "UTIB0007773", city: "Hyderabad", state: "Telangana", pan: "AAABC9012E", phone: "9977012233", ipAddress: "62.210.5.90", email: "shell3@offshore.io" },
  { name: "Shadow Finserv (Shell)", bank: "State Bank of India", ifsc: "SBIN0007774", city: "Mumbai", state: "Maharashtra", pan: "AAHFS3344F", phone: "9955667788", ipAddress: "91.120.88.12", email: "shadow@offshore.io" },
  { name: "Matrix Capital (Shell)", bank: "Kotak Mahindra Bank", ifsc: "KKBK0007775", city: "Pune", state: "Maharashtra", pan: "AAZFM5566G", phone: "9444001122", ipAddress: "185.25.199.77", email: "matrix@offshore.io" },
  { name: "Structured Payments (Shell)", bank: "Punjab National Bank", ifsc: "PUNB0007776", city: "Delhi", state: "Delhi", pan: "AABCS7788H", phone: "9433221100", ipAddress: "172.31.44.90", email: "struct@offshore.io" },
  { name: "Dormant Awakener (Shell)", bank: "IDFC First Bank", ifsc: "FDRL0007777", city: "Kolkata", state: "West Bengal", pan: "AAHFD1122J", phone: "9888877766", ipAddress: "91.121.65.210", email: "dormant@offshore.io" },
  { name: "RapidPay Services (Shell)", bank: "Bank of Baroda", ifsc: "BARB0007778", city: "Chennai", state: "Tamil Nadu", pan: "AAKBR3344K", phone: "9332211009", ipAddress: "2.56.17.104", email: "rapid@offshore.io" },
];

const OFFSHORE = ["NG", "RU", "CY", "VG", "PA", "KY", "SC", "RU"];

const ACCOUNTS = Array.from({ length: 20 }).map((_, i) => {
  const idx = i + 1;
  const id = `ACC${String(idx).padStart(3, "0")}`;
  const isSuspicious = [2, 3, 7, 8, 13, 16, 19].includes(idx);
  const riskScore = isSuspicious ? 72 + (idx % 24) : 12 + (idx % 26);
  const d = ACCOUNT_DETAILS[i];
  const displayName = isSuspicious
    ? d.name
    : d.name.replace(/\s*\(Shell\)\s*/gi, "").trim() || `Account Holder ${idx}`;
  const useOffshore = isSuspicious && idx >= 13;
  return {
    id,
    name: displayName,
    type: isSuspicious ? "shell" : idx % 2 ? "individual" : "business",
    bank: d.bank,
    ifsc: d.ifsc,
    city: d.city,
    state: d.state,
    pan: d.pan,
    phone: d.phone,
    ipAddress: d.ipAddress,
    country: useOffshore ? OFFSHORE[Math.min(idx - 13, OFFSHORE.length - 1)] : "IN",
    balance: 200000 + idx * 95000,
    createdAt: "2025-01-15",
    transactionCount: 30 + idx * 3,
    riskScore,
    isSuspicious,
    lastLoginCity: d.city,
    lastLoginIP: d.ipAddress,
    lastActive: new Date(Date.UTC(2026, 2, 15, 10, 0, 0)).toISOString(),
    email: d.email,
  };
});

const TRANSACTIONS = Array.from({ length: 48 }).map((_, i) => {
  const n = i + 1;
  const fromN = (n % 20) + 1;
  const toN = ((n + 5) % 20) + 1;
  const suspicious = [6, 7, 8, 19, 20, 21, 30, 31, 32, 44].includes(n);
  const flagged = [8, 21, 32, 44].includes(n);
  return {
    id: `TXN${String(n).padStart(4, "0")}`,
    from: `ACC${String(fromN).padStart(3, "0")}`,
    to: `ACC${String(toN).padStart(3, "0")}`,
    amount: flagged ? 225000 + n * 3500 : 18000 + n * 1400,
    timestamp: new Date(Date.UTC(2026, 3, 1, 9, n % 60, 0)).toISOString(),
    riskScore: flagged ? 88 : suspicious ? 68 : 22 + (n % 12),
    status: flagged ? "flagged" : suspicious ? "suspicious" : "normal",
    type: ["UPI", "NEFT", "IMPS", "RTGS"][n % 4],
  };
});

const ALERTS = [
  {
    id: "ALT001",
    type: "circular_transaction",
    accountId: "ACC002",
    riskScore: 92,
    timestamp: new Date(Date.UTC(2026, 3, 1, 10, 12, 0)).toISOString(),
    status: "open",
    description: "Circular pattern detected for ACC002 across linked beneficiaries.",
    reasons: ["Looped fund movement", "Rapid hop sequence", "High-value churn"],
    amount: 245000,
    email: "rahul.v@email.in",
  },
  {
    id: "ALT002",
    type: "structuring",
    accountId: "ACC007",
    riskScore: 74,
    timestamp: new Date(Date.UTC(2026, 3, 1, 10, 28, 0)).toISOString(),
    status: "investigating",
    description: "Repeated sub-threshold transfers suggest structuring behavior.",
    reasons: ["Multiple sub-threshold payments", "Pattern repeat in short interval"],
    amount: 9800,
    email: "holdings@patel.in",
  },
  {
    id: "ALT003",
    type: "velocity",
    accountId: "ACC016",
    riskScore: 86,
    timestamp: new Date(Date.UTC(2026, 3, 1, 10, 42, 0)).toISOString(),
    status: "open",
    description: "Transaction velocity exceeds baseline for ACC016.",
    reasons: ["Amount spike", "Frequency surge", "Behavior deviation"],
    amount: 312000,
    email: "shadow@offshore.io",
  },
];

const totalVol = TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
const avgRisk = Math.round(TRANSACTIONS.reduce((s, t) => s + t.riskScore, 0) / TRANSACTIONS.length);

const STATS = {
  totalTransactions: TRANSACTIONS.length,
  suspiciousTransactions: TRANSACTIONS.filter((t) => t.status !== "normal").length,
  highRiskAccounts: ACCOUNTS.filter((a) => a.riskScore >= 75).length,
  fraudAlerts: ALERTS.filter((a) => a.status === "open").length,
  totalVolume: totalVol,
  avgRiskScore: avgRisk,
};

const transactionVolumeData = Array.from({ length: 15 }).map((_, i) => ({
  date: `Apr ${i + 1}`,
  transactions: 900 + i * 35,
  suspicious: 14 + (i % 11),
  volume: 3000000 + i * 110000,
}));

const riskDistributionData = [
  { risk: "Low (0-25)", count: 8420, fill: "var(--chart-2)" },
  { risk: "Medium (26-50)", count: 4120, fill: "var(--chart-4)" },
  { risk: "High (51-75)", count: 2380, fill: "var(--chart-5)" },
  { risk: "Critical (76-100)", count: 760, fill: "var(--chart-3)" },
];

const normalCount = TRANSACTIONS.filter((t) => t.status === "normal").length;
const suspCount = TRANSACTIONS.filter((t) => t.status !== "normal").length;

const fraudVsNormalData = [
  { name: "Normal", value: normalCount, fill: "var(--chart-2)" },
  { name: "Suspicious", value: suspCount, fill: "var(--chart-3)" },
];

const graphNodes = ACCOUNTS.slice(0, 12).map((acc, i) => ({
  id: acc.id,
  type: "accountNode",
  position: { x: (i % 4) * 220, y: Math.floor(i / 4) * 170 },
  data: { label: acc.name.split(" ").slice(0, 3).join(" "), account: acc },
}));

const graphSet = new Set(graphNodes.map((n) => n.id));
const graphEdges = TRANSACTIONS.filter((t) => graphSet.has(t.from) && graphSet.has(t.to)).map((t, i) => ({
  id: `e-${i}-${t.id}`,
  source: t.from,
  target: t.to,
  animated: t.status === "flagged",
  style: { stroke: t.status === "flagged" ? "#ff3860" : t.status === "suspicious" ? "#ffd000" : "#00e676" },
  data: { amount: t.amount, suspicious: t.status !== "normal" },
}));

export const getBootstrapData = (_req, res) => {
  res.json({
    accounts: ACCOUNTS,
    transactions: TRANSACTIONS,
    alerts: ALERTS,
    stats: STATS,
    transactionVolumeData,
    riskDistributionData,
    fraudVsNormalData,
    graphNodes,
    graphEdges,
  });
};
