// Mock data generator for GraphSentinel AI
// Notes:
// - This file intentionally generates different suspicious patterns on every import (page refresh/restart).
// - Data shapes match the existing dashboard UI consumers.

/* eslint-disable @typescript-eslint/no-unused-vars */

export type FraudType =
  | "circular_transaction"
  | "structuring"
  | "rapid_transfer"
  | "velocity"
  | "dormant_activation"
  | "impossible_travel"
  | "fan_out"

export type TransactionStatus = "normal" | "suspicious" | "flagged"

export type TransactionType = "UPI" | "NEFT" | "IMPS" | "RTGS"

// UI currently models only these alert types.
// We still generate "impossible_travel" and "fan_out" patterns in transactions/reasons,
// but map them to one of these alert types for UI compatibility.
export type AlertType =
  | "circular_transaction"
  | "rapid_transfer"
  | "structuring"
  | "velocity"
  | "dormant_activation"

export interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  timestamp: string
  riskScore: number
  status: TransactionStatus
  type: TransactionType

  // Optional metadata to support specific fraud patterns.
  fromCity?: string
  toCity?: string
  fromCountry?: string
  toCountry?: string
  fraudType?: FraudType
}

export interface Account {
  id: string
  name: string
  type: "individual" | "business" | "shell"

  bank: string
  ifsc: string
  city: string
  state: string

  pan: string
  phone: string
  ipAddress: string

  country: string
  balance: number
  createdAt: string
  transactionCount: number

  riskScore: number
  isSuspicious: boolean

  // Generated per session based on fraud selection.
  lastLoginCity?: string
  lastLoginIP?: string
  lastActive?: string
  fraudType?: FraudType
}

export interface Alert {
  id: string
  // UI expects only a subset; we map dynamically for compatibility.
  type: AlertType
  accountId: string
  riskScore: number
  timestamp: string
  status: "open" | "investigating" | "resolved"
  description: string
  amount?: number
  reasons?: string[]
  fraudType?: FraudType
}

export interface DashboardStats {
  totalTransactions: number
  suspiciousTransactions: number
  highRiskAccounts: number
  fraudAlerts: number
  totalVolume: number
  avgRiskScore: number
}

// ---------- Utilities ----------
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Static epoch used to keep the 20 account base records stable across refreshes.
// Suspicious selection/risk/transactions are still randomized in `generateDynamicData()`.
const STATIC_EPOCH_MS = new Date("2026-04-03T12:00:00.000Z").getTime()

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function sampleWithoutReplacement<T>(arr: T[], count: number) {
  return shuffle(arr).slice(0, count)
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function formatINR(amount: number) {
  // UI already renders with ₹{...toLocaleString("en-IN")}, but we also include formatting in descriptions.
  return `₹${amount.toLocaleString("en-IN")}`
}

function ipToInt(ip: string) {
  const parts = ip.split(".").map((p) => Number(p))
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
}

function intToIp(n: number) {
  return [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255,
  ].join(".")
}

function generateSimilarIpDifferent(ip: string) {
  const base = ipToInt(ip)
  const delta = randInt(1234, 999999) * (Math.random() > 0.5 ? 1 : -1)
  return intToIp((base + delta) >>> 0)
}

function randomTimestampWithinMinutes(fromNowMs: number, minutes: number) {
  // fromNowMs = Date.now() - offsetMs anchor
  const offset = randInt(0, minutes * 60 * 1000)
  return new Date(fromNowMs + offset).toISOString()
}

function baseCreatedAtDaysAgo(daysAgoMin: number, daysAgoMax: number) {
  const range = daysAgoMax - daysAgoMin + 1
  const seed = (daysAgoMin * 9973 + daysAgoMax * 19997) >>> 0
  const daysAgo = daysAgoMin + (seed % range)
  const d = new Date(STATIC_EPOCH_MS - daysAgo * 24 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 10)
}

function buildAmountFromBalance(balance: number, scaleDiv: number) {
  // Helps keep normal vs suspicious orders of magnitude plausible.
  const base = Math.round(balance / scaleDiv)
  return clamp(base, 250000, 60000000)
}

// ---------- Fixed (session-stable) Account Base Data ----------
type AccountBase = Omit<Account, "riskScore" | "isSuspicious" | "lastLoginCity" | "lastLoginIP" | "fraudType" | "lastActive">
type AccountComputedBase = AccountBase & { avgTransactionAmount: number; lastActiveBase: string }

const FOREIGN_LOGIN_CITIES = [
  "Moscow",
  "Lagos",
  "Panama City",
  "Nicosia",
  "Nassau",
]

const FOREIGN_IP_SEEDS = [
  "185.25.199.77",
  "103.214.45.18",
  "172.31.44.90",
  "91.121.65.210",
  "2.56.17.104",
]

const OFFSHORE_COUNTRIES = ["NG", "RU", "CY", "VG", "PA", "KY", "SC"]

// IFSC prefixes (approximate realistic patterns; this is mock data).
const BANK_IFSC_PREFIX: Record<string, string> = {
  "State Bank of India": "SBIN000",
  "HDFC Bank": "HDFC000",
  "ICICI Bank": "ICIC000",
  "Axis Bank": "UTIB000",
  "Kotak Mahindra Bank": "KKBK000",
  "Punjab National Bank": "PUNB000",
  "Canara Bank": "CNRB000",
  "IndusInd Bank": "INDB000",
  "IDFC First Bank": "FDRL000",
  "Bank of Baroda": "BARB000",
  "Yes Bank": "YESB000",
}

function makeIfsc(bank: string, branchDigits: string) {
  const prefix = BANK_IFSC_PREFIX[bank] || "SBIN0"
  return `${prefix}${branchDigits}`
}

const ACCOUNT_BASE: AccountComputedBase[] = [
  // Individuals (country IN)
  {
    id: "ACC001",
    name: "Ananya Kulkarni",
    type: "individual",
    bank: "State Bank of India",
    ifsc: makeIfsc("State Bank of India", "0123"),
    city: "Mumbai",
    state: "Maharashtra",
    pan: "ABKPR1234K",
    phone: "9876543210",
    ipAddress: "103.21.45.67",
    country: "IN",
    balance: 4500000,
    createdAt: baseCreatedAtDaysAgo(600, 2000),
    transactionCount: 89,
    avgTransactionAmount: 450000,
    lastActiveBase: new Date(Date.now() - randInt(10, 180) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC002",
    name: "Rahul Verma",
    type: "individual",
    bank: "ICICI Bank",
    ifsc: makeIfsc("ICICI Bank", "0456"),
    city: "Delhi",
    state: "Delhi",
    pan: "BCKPV2345L",
    phone: "9811122334",
    ipAddress: "106.51.22.10",
    country: "IN",
    balance: 2800000,
    createdAt: baseCreatedAtDaysAgo(1000, 2200),
    transactionCount: 234,
    avgTransactionAmount: 250000,
    lastActiveBase: new Date(Date.now() - randInt(20, 250) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC003",
    name: "Neha Gupta",
    type: "individual",
    bank: "HDFC Bank",
    ifsc: makeIfsc("HDFC Bank", "0789"),
    city: "Bengaluru",
    state: "Karnataka",
    pan: "CDRGS3456M",
    phone: "9822334455",
    ipAddress: "49.205.77.88",
    country: "IN",
    balance: 7600000,
    createdAt: baseCreatedAtDaysAgo(300, 1200),
    transactionCount: 121,
    avgTransactionAmount: 600000,
    lastActiveBase: new Date(Date.now() - randInt(5, 160) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC004",
    name: "Rohit Sharma",
    type: "individual",
    bank: "Axis Bank",
    ifsc: makeIfsc("Axis Bank", "0198"),
    city: "Hyderabad",
    state: "Telangana",
    pan: "EFTRS4567N",
    phone: "9900112233",
    ipAddress: "182.71.14.39",
    country: "IN",
    balance: 3900000,
    createdAt: baseCreatedAtDaysAgo(450, 1600),
    transactionCount: 77,
    avgTransactionAmount: 320000,
    lastActiveBase: new Date(Date.now() - randInt(30, 220) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC005",
    name: "Priya Nair",
    type: "individual",
    bank: "Punjab National Bank",
    ifsc: makeIfsc("Punjab National Bank", "0333"),
    city: "Chennai",
    state: "Tamil Nadu",
    pan: "GHIEN5678P",
    phone: "9344556677",
    ipAddress: "120.63.190.55",
    country: "IN",
    balance: 5100000,
    createdAt: baseCreatedAtDaysAgo(800, 2400),
    transactionCount: 160,
    avgTransactionAmount: 420000,
    lastActiveBase: new Date(Date.now() - randInt(10, 210) * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Businesses (country IN)
  {
    id: "ACC006",
    name: "Sharma Exports Pvt Ltd",
    type: "business",
    bank: "State Bank of India",
    ifsc: makeIfsc("State Bank of India", "0999"),
    city: "Pune",
    state: "Maharashtra",
    pan: "AABCS1234K",
    phone: "9765432109",
    ipAddress: "103.17.2.44",
    country: "IN",
    balance: 25000000,
    createdAt: baseCreatedAtDaysAgo(900, 3200),
    transactionCount: 156,
    avgTransactionAmount: 1200000,
    lastActiveBase: new Date(Date.now() - randInt(15, 260) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC007",
    name: "Patel Holdings",
    type: "business",
    bank: "HDFC Bank",
    ifsc: makeIfsc("HDFC Bank", "0222"),
    city: "Ahmedabad",
    state: "Gujarat",
    pan: "AAZHP5678Q",
    phone: "9898981212",
    ipAddress: "122.160.88.101",
    country: "IN",
    balance: 18000000,
    createdAt: baseCreatedAtDaysAgo(400, 1400),
    transactionCount: 67,
    avgTransactionAmount: 900000,
    lastActiveBase: new Date(Date.now() - randInt(20, 300) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC008",
    name: "Mehta Trade LLP",
    type: "business",
    bank: "ICICI Bank",
    ifsc: makeIfsc("ICICI Bank", "0550"),
    city: "Kolkata",
    state: "West Bengal",
    pan: "AAKFN9012R",
    phone: "9911223344",
    ipAddress: "103.55.61.9",
    country: "IN",
    balance: 16500000,
    createdAt: baseCreatedAtDaysAgo(700, 2600),
    transactionCount: 98,
    avgTransactionAmount: 780000,
    lastActiveBase: new Date(Date.now() - randInt(25, 360) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC009",
    name: "Reddy Ventures",
    type: "business",
    bank: "Axis Bank",
    ifsc: makeIfsc("Axis Bank", "0777"),
    city: "Lucknow",
    state: "Uttar Pradesh",
    pan: "AAZCR3456S",
    phone: "9123456789",
    ipAddress: "14.139.221.72",
    country: "IN",
    balance: 20900000,
    createdAt: baseCreatedAtDaysAgo(850, 2800),
    transactionCount: 45,
    avgTransactionAmount: 1500000,
    lastActiveBase: new Date(Date.now() - randInt(40, 420) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC010",
    name: "Anurag Singh & Co.",
    type: "business",
    bank: "Kotak Mahindra Bank",
    ifsc: makeIfsc("Kotak Mahindra Bank", "0101"),
    city: "Jaipur",
    state: "Rajasthan",
    pan: "ACNPS7788T",
    phone: "9000012345",
    ipAddress: "180.95.44.18",
    country: "IN",
    balance: 12500000,
    createdAt: baseCreatedAtDaysAgo(500, 2000),
    transactionCount: 72,
    avgTransactionAmount: 520000,
    lastActiveBase: new Date(Date.now() - randInt(12, 220) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC011",
    name: "Cascade Investments India",
    type: "business",
    bank: "Canara Bank",
    ifsc: makeIfsc("Canara Bank", "0202"),
    city: "Nagpur",
    state: "Maharashtra",
    pan: "AAQCC2345U",
    phone: "9812345678",
    ipAddress: "49.206.10.2",
    country: "IN",
    balance: 13500000,
    createdAt: baseCreatedAtDaysAgo(600, 2400),
    transactionCount: 41,
    avgTransactionAmount: 650000,
    lastActiveBase: new Date(Date.now() - randInt(30, 420) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC012",
    name: "Final Route Consultants",
    type: "business",
    bank: "IndusInd Bank",
    ifsc: makeIfsc("IndusInd Bank", "0331"),
    city: "Chandigarh",
    state: "Chandigarh",
    pan: "AARHF9012V",
    phone: "9870098765",
    ipAddress: "103.2.17.199",
    country: "IN",
    balance: 14500000,
    createdAt: baseCreatedAtDaysAgo(850, 3000),
    transactionCount: 58,
    avgTransactionAmount: 720000,
    lastActiveBase: new Date(Date.now() - randInt(15, 320) * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Shell accounts (base country offshore)
  {
    id: "ACC013",
    name: "Patel Holdings (Shell)",
    type: "shell",
    bank: "HDFC Bank",
    ifsc: makeIfsc("HDFC Bank", "7771"),
    city: "Delhi",
    state: "Delhi",
    pan: "AAAPL1234C",
    phone: "9890011122",
    ipAddress: "41.66.12.250",
    country: "NG",
    balance: 18000000,
    createdAt: baseCreatedAtDaysAgo(250, 1400),
    transactionCount: 23,
    avgTransactionAmount: 950000,
    lastActiveBase: new Date(Date.now() - randInt(60, 720) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC014",
    name: "Mehta Trade (Shell)",
    type: "shell",
    bank: "ICICI Bank",
    ifsc: makeIfsc("ICICI Bank", "7772"),
    city: "Bengaluru",
    state: "Karnataka",
    pan: "AABCK5678D",
    phone: "9988007766",
    ipAddress: "38.120.90.41",
    country: "RU",
    balance: 16500000,
    createdAt: baseCreatedAtDaysAgo(220, 1300),
    transactionCount: 18,
    avgTransactionAmount: 820000,
    lastActiveBase: new Date(Date.now() - randInt(120, 900) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC015",
    name: "Reddy Ventures (Shell)",
    type: "shell",
    bank: "Axis Bank",
    ifsc: makeIfsc("Axis Bank", "7773"),
    city: "Hyderabad",
    state: "Telangana",
    pan: "AAABC9012E",
    phone: "9977012233",
    ipAddress: "62.210.5.90",
    country: "CY",
    balance: 20900000,
    createdAt: baseCreatedAtDaysAgo(180, 1200),
    transactionCount: 12,
    avgTransactionAmount: 1100000,
    lastActiveBase: new Date(Date.now() - randInt(140, 1100) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC016",
    name: "Shadow Finserv (Shell)",
    type: "shell",
    bank: "State Bank of India",
    ifsc: makeIfsc("State Bank of India", "7774"),
    city: "Mumbai",
    state: "Maharashtra",
    pan: "AAHFS3344F",
    phone: "9955667788",
    ipAddress: "91.120.88.12",
    country: "VG",
    balance: 86500000,
    createdAt: baseCreatedAtDaysAgo(150, 1000),
    transactionCount: 34,
    avgTransactionAmount: 8200000,
    lastActiveBase: new Date(Date.now() - randInt(180, 900) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC017",
    name: "Matrix Capital (Shell)",
    type: "shell",
    bank: "Kotak Mahindra Bank",
    ifsc: makeIfsc("Kotak Mahindra Bank", "7775"),
    city: "Pune",
    state: "Maharashtra",
    pan: "AAZFM5566G",
    phone: "9444001122",
    ipAddress: "185.25.199.77",
    country: "PA",
    balance: 84000000,
    createdAt: baseCreatedAtDaysAgo(130, 900),
    transactionCount: 28,
    avgTransactionAmount: 7400000,
    lastActiveBase: new Date(Date.now() - randInt(220, 1400) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC018",
    name: "Structured Payments (Shell)",
    type: "shell",
    bank: "Punjab National Bank",
    ifsc: makeIfsc("Punjab National Bank", "7776"),
    city: "Delhi",
    state: "Delhi",
    pan: "AABCS7788H",
    phone: "9433221100",
    ipAddress: "172.31.44.90",
    country: "KY",
    balance: 12500000,
    createdAt: baseCreatedAtDaysAgo(200, 1200),
    transactionCount: 67,
    avgTransactionAmount: 540000,
    lastActiveBase: new Date(Date.now() - randInt(80, 650) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC019",
    name: "Dormant Awakener (Shell)",
    type: "shell",
    bank: "IDFC First Bank",
    ifsc: makeIfsc("IDFC First Bank", "7777"),
    city: "Kolkata",
    state: "West Bengal",
    pan: "AAHFD1122J",
    phone: "9888877766",
    ipAddress: "91.121.65.210",
    country: "SC",
    balance: 52000000,
    createdAt: baseCreatedAtDaysAgo(120, 800),
    transactionCount: 89,
    avgTransactionAmount: 3500000,
    lastActiveBase: new Date(Date.now() - randInt(250, 1200) * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ACC020",
    name: "RapidPay Services (Shell)",
    type: "shell",
    bank: "Bank of Baroda",
    ifsc: makeIfsc("Bank of Baroda", "7778"),
    city: "Chennai",
    state: "Tamil Nadu",
    pan: "AAKBR3344K",
    phone: "9332211009",
    ipAddress: "2.56.17.104",
    country: "RU",
    balance: 89000000,
    createdAt: baseCreatedAtDaysAgo(90, 700),
    transactionCount: 445,
    avgTransactionAmount: 6400000,
    lastActiveBase: new Date(Date.now() - randInt(15, 500) * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Ensure we always have exactly 20 accounts.
const ACCOUNT_IDS = ACCOUNT_BASE.map((a) => a.id)

function mapFraudTypeToAlertType(fraudType: FraudType): AlertType {
  switch (fraudType) {
    case "circular_transaction":
      return "circular_transaction"
    case "structuring":
      return "structuring"
    case "rapid_transfer":
      return "rapid_transfer"
    case "velocity":
      return "velocity"
    case "dormant_activation":
      return "dormant_activation"
    case "impossible_travel":
      // Map to velocity for UI compatibility.
      return "velocity"
    case "fan_out":
      // Map to rapid transfer for UI compatibility.
      return "rapid_transfer"
    default:
      return "velocity"
  }
}

function generateReasons(fraudType: FraudType, account: Account) {
  const city = account.city
  const bank = account.bank
  const name = account.name

  switch (fraudType) {
    case "circular_transaction":
      return [
        `Circular fund flow detected for ${name} (${bank}) around ${city}.`,
        "Amounts cycle across linked beneficiaries in a short window.",
        "Pattern suggests loop-based laundering behavior.",
      ]
    case "structuring":
      return [
        `Structuring signals observed: multiple sub-threshold transfers from ${name} in ${city}.`,
        "Repeated amounts avoid reporting/threshold triggers.",
        "High concentration of just-below ₹10,000 movements.",
      ]
    case "rapid_transfer":
      return [
        `Rapid transfer activity for ${name} in ${city}.`,
        "Multiple outgoing hops executed within minutes.",
        "Beneficiaries diversified, consistent with dispersal attempts.",
      ]
    case "velocity":
      return [
        `Velocity anomaly for ${name}: transaction size exceeds historical average in ${city}.`,
        "Amount multiple indicates potential sudden capital injection.",
        "Behavior deviates from typical transaction baseline.",
      ]
    case "dormant_activation":
      return [
        `Dormant activation for ${name} in ${city}.`,
        "Account activity resumed after a long inactivity gap.",
        "Large movement follows reactivation, increasing risk.",
      ]
    case "impossible_travel":
      return [
        `Impossible travel risk: login/transfer activity from a foreign city while registered in ${city}.`,
        "Foreign geolocation mismatch increases account takeover suspicion.",
        `Cross-jurisdiction transfers linked to ${name} (${bank}).`,
      ]
    case "fan_out":
      return [
        `Fan-out behavior for ${name}: one sender dispersing to many beneficiaries in ${city}.`,
        "One-to-many transfer pattern within a short time window.",
        "Multiple recipients increase layering/obfuscation likelihood.",
      ]
    default:
      return [
        `Suspicious pattern detected for ${name} in ${city}.`,
        "Activity deviates from normal behavioral baselines.",
      ]
  }
}

function generateFraudTransactions(params: {
  patternAccount: Account
  patternFraudType: FraudType
  allAccounts: Account[]
  suspiciousAccountRiskScore: number
  timeAnchorMs: number
  txIdStart: number
}) {
  const { patternAccount, patternFraudType, allAccounts, suspiciousAccountRiskScore, timeAnchorMs, txIdStart } =
    params

  const txns: Transaction[] = []
  let txCounter = txIdStart

  // Helper to create a transaction object.
  const mkTxn = (p: {
    from: string
    to: string
    amount: number
    minutesOffset: number
    status: TransactionStatus
    type: TransactionType
    riskScore: number
    fromCity?: string
    toCity?: string
    fromCountry?: string
    toCountry?: string
    fraudType?: FraudType
  }) => {
    const timestamp = new Date(timeAnchorMs + p.minutesOffset * 60 * 1000).toISOString()
    const id = `TXN${String(txCounter).padStart(4, "0")}`
    txCounter++
    txns.push({
      id,
      from: p.from,
      to: p.to,
      amount: Math.round(p.amount),
      timestamp,
      riskScore: Math.round(clamp(p.riskScore, 0, 100)),
      status: p.status,
      type: p.type,
      fromCity: p.fromCity,
      toCity: p.toCity,
      fromCountry: p.fromCountry,
      toCountry: p.toCountry,
      fraudType: p.fraudType,
    })
  }

  const otherAccounts = allAccounts.filter((a) => a.id !== patternAccount.id)
  const suspiciousRiskBase = suspiciousAccountRiskScore
  const txType = (): TransactionType => pickOne(["UPI", "NEFT", "IMPS", "RTGS"])

  const patternStatus = (): TransactionStatus => {
    // Align with UI visual behavior.
    return suspiciousRiskBase >= 80 ? "flagged" : "suspicious"
  }

  const statusForRisk = () => patternStatus()
  const baseAvg = patternAccount.type === "shell" ? patternAccount.balance / 40 : patternAccount.balance / 25
  const avgAmount = clamp(Math.round(baseAvg), 250000, 9000000)

  switch (patternFraudType) {
    case "circular_transaction": {
      // A -> B -> C -> A
      const [B, C] = sampleWithoutReplacement(otherAccounts, 2)
      const A = patternAccount
      const startAmount = clamp(Math.round(avgAmount * randInt(2, 6)), 300000, 90000000)
      const amounts = [startAmount, Math.round(startAmount * randInt(85, 96) / 100), Math.round(startAmount * randInt(75, 90) / 100)]

      mkTxn({
        from: A.id,
        to: B.id,
        amount: amounts[0],
        minutesOffset: randInt(0, 8),
        status: statusForRisk(),
        type: txType(),
        riskScore: clamp(suspiciousRiskBase + randInt(-3, 8), 0, 100),
        fraudType: patternFraudType,
        fromCity: A.city,
        toCity: B.city,
        fromCountry: A.country,
        toCountry: B.country,
      })
      mkTxn({
        from: B.id,
        to: C.id,
        amount: amounts[1],
        minutesOffset: randInt(1, 10),
        status: statusForRisk(),
        type: txType(),
        riskScore: clamp(suspiciousRiskBase + randInt(-5, 6), 0, 100),
        fraudType: patternFraudType,
        fromCity: B.city,
        toCity: C.city,
        fromCountry: B.country,
        toCountry: C.country,
      })
      mkTxn({
        from: C.id,
        to: A.id,
        amount: amounts[2],
        minutesOffset: randInt(2, 10),
        status: statusForRisk(),
        type: txType(),
        riskScore: clamp(suspiciousRiskBase + randInt(-6, 5), 0, 100),
        fraudType: patternFraudType,
        fromCity: C.city,
        toCity: A.city,
        fromCountry: C.country,
        toCountry: A.country,
      })
      break
    }

    case "structuring": {
      // 6 tx just below ₹10,000
      const recipients = sampleWithoutReplacement(otherAccounts, Math.min(6, otherAccounts.length))
      for (let i = 0; i < 6; i++) {
        const to = recipients[i % recipients.length]
        const amt = randInt(8500, 9900)
        mkTxn({
          from: patternAccount.id,
          to: to.id,
          amount: amt,
          minutesOffset: randInt(0, 55),
          status: statusForRisk(),
          type: txType(),
          riskScore: clamp(suspiciousRiskBase + randInt(0, 10), 0, 100),
          fraudType: patternFraudType,
          fromCity: patternAccount.city,
          toCity: to.city,
          fromCountry: patternAccount.country,
          toCountry: to.country,
        })
      }
      break
    }

    case "impossible_travel": {
      // One tx with foreign fromCity, while account is registered in Indian city.
      const to = pickOne(otherAccounts)
      const foreignCity = pickOne(FOREIGN_LOGIN_CITIES)
      const foreignCountry = pickOne(OFFSHORE_COUNTRIES)
      const amount = clamp(Math.round(avgAmount * randInt(6, 18)), 500000, 60000000)
      mkTxn({
        from: patternAccount.id,
        to: to.id,
        amount,
        minutesOffset: randInt(0, 12),
        status: statusForRisk(),
        type: txType(),
        riskScore: clamp(suspiciousRiskBase + randInt(0, 12), 0, 100),
        fraudType: patternFraudType,
        fromCity: foreignCity,
        toCity: to.city,
        fromCountry: foreignCountry,
        toCountry: to.country,
      })
      break
    }

    case "rapid_transfer": {
      // 5+ tx within 5 minutes to different accounts
      const count = randInt(5, 8)
      const recipients = sampleWithoutReplacement(otherAccounts, Math.min(count, otherAccounts.length))
      const startAmt = clamp(Math.round(avgAmount * randInt(2, 5)), 600000, 90000000)
      for (let i = 0; i < recipients.length; i++) {
        const to = recipients[i]
        const amt = clamp(Math.round(startAmt * randInt(80, 105) / 100), 400000, 120000000)
        mkTxn({
          from: patternAccount.id,
          to: to.id,
          amount: amt,
          minutesOffset: randInt(0, 4),
          status: statusForRisk(),
          type: txType(),
          riskScore: clamp(suspiciousRiskBase + randInt(-2, 10), 0, 100),
          fraudType: patternFraudType,
          fromCity: patternAccount.city,
          toCity: to.city,
          fromCountry: patternAccount.country,
          toCountry: to.country,
        })
      }
      break
    }

    case "dormant_activation": {
      const to = pickOne(otherAccounts)
      const amount = clamp(Math.round(avgAmount * randInt(10, 18)), 2000000, 90000000)
      mkTxn({
        from: patternAccount.id,
        to: to.id,
        amount,
        minutesOffset: randInt(0, 15),
        status: statusForRisk(),
        type: txType(),
        riskScore: clamp(suspiciousRiskBase + randInt(0, 14), 0, 100),
        fraudType: patternFraudType,
        fromCity: patternAccount.city,
        toCity: to.city,
        fromCountry: patternAccount.country,
        toCountry: to.country,
      })
      break
    }

    case "fan_out": {
      // One to 7 different accounts within minutes
      const recipients = sampleWithoutReplacement(otherAccounts, Math.min(7, otherAccounts.length))
      const baseAmt = clamp(Math.round(avgAmount * randInt(1, 3)), 300000, 25000000)
      for (let i = 0; i < recipients.length; i++) {
        const to = recipients[i]
        const amt = clamp(Math.round(baseAmt * randInt(85, 110) / 100), 200000, 50000000)
        mkTxn({
          from: patternAccount.id,
          to: to.id,
          amount: amt,
          minutesOffset: randInt(0, 6),
          status: statusForRisk(),
          type: txType(),
          riskScore: clamp(suspiciousRiskBase + randInt(-1, 10), 0, 100),
          fraudType: patternFraudType,
          fromCity: patternAccount.city,
          toCity: to.city,
          fromCountry: patternAccount.country,
          toCountry: to.country,
        })
      }
      break
    }

    case "velocity": {
      // amount is ~4x larger than average
      const to = pickOne(otherAccounts)
      const amount = clamp(Math.round(avgAmount * 4 * randInt(95, 115) / 100), 500000, 80000000)
      mkTxn({
        from: patternAccount.id,
        to: to.id,
        amount,
        minutesOffset: randInt(0, 20),
        status: statusForRisk(),
        type: txType(),
        riskScore: clamp(suspiciousRiskBase + randInt(3, 18), 0, 100),
        fraudType: patternFraudType,
        fromCity: patternAccount.city,
        toCity: to.city,
        fromCountry: patternAccount.country,
        toCountry: to.country,
      })
      break
    }

    default:
      break
  }

  return txns
}

function generateNormalTransactions(params: {
  accounts: Account[]
  timeAnchorMs: number
  startCounter: number
  countPerAccountRange: [number, number]
}) {
  const { accounts, timeAnchorMs, startCounter, countPerAccountRange } = params
  const txns: Transaction[] = []
  let counter = startCounter

  const txTypes: TransactionType[] = ["UPI", "NEFT", "IMPS", "RTGS"]
  const txType = () => pickOne(txTypes)

  const makeId = () => `TXN${String(counter++).padStart(4, "0")}`

  const mk = (t: {
    from: Account
    to: Account
    amount: number
    timestamp: string
    riskScore: number
    status: TransactionStatus
    type: TransactionType
  }) => {
    txns.push({
      id: makeId(),
      from: t.from.id,
      to: t.to.id,
      amount: t.amount,
      timestamp: t.timestamp,
      riskScore: t.riskScore,
      status: t.status,
      type: t.type,
    })
  }

  for (const acc of accounts) {
    const other = accounts.filter((a) => a.id !== acc.id)
    const n = randInt(countPerAccountRange[0], countPerAccountRange[1])

    for (let i = 0; i < n; i++) {
      const to = pickOne(other)
      const amt = clamp(Math.round(acc.balance / randInt(60, 140)), 200000, 25000000)
      // Keep normal transactions mostly below suspicious thresholds.
      mk({
        from: acc,
        to,
        amount: amt,
        timestamp: randomTimestampWithinMinutes(timeAnchorMs, 180),
        riskScore: clamp(randInt(5, 38) + (acc.isSuspicious ? randInt(-2, 8) : 0), 0, 100),
        status: "normal",
        type: txType(),
      })
    }
  }

  return txns
}

function generateChartData() {
  const today = new Date()
  const days = 15

  const labels: { date: string; transactions: number; suspicious: number; volume: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const label = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d)
    const transactions = randInt(800, 1800)
    const suspicious = randInt(10, 60)
    const volume = transactions * randInt(250000, 650000)
    labels.push({ date: label, transactions, suspicious, volume })
  }

  const riskDistributionData = [
    { risk: "Low (0-25)", count: randInt(3800, 9000), fill: "var(--chart-2)" },
    { risk: "Medium (26-50)", count: randInt(1500, 6000), fill: "var(--chart-4)" },
    { risk: "High (51-75)", count: randInt(700, 3500), fill: "var(--chart-5)" },
    { risk: "Critical (76-100)", count: randInt(200, 1400), fill: "var(--chart-3)" },
  ]

  // Pie split: normal vs suspicious
  const normal = randInt(90000, 140000)
  const suspicious = randInt(1000, 5000)
  const fraudVsNormalData = [
    { name: "Normal", value: normal, fill: "var(--chart-2)" },
    { name: "Suspicious", value: suspicious, fill: "var(--chart-3)" },
  ]

  return { transactionVolumeData: labels, riskDistributionData, fraudVsNormalData }
}

function generateGraph(params: { accounts: Account[]; transactions: Transaction[] }) {
  const { accounts, transactions } = params
  const first12 = accounts.slice(0, 12)
  const cols = 4
  const spacingX = 240
  const spacingY = 170

  const nodes = first12.map((acc, idx) => {
    const row = Math.floor(idx / cols)
    const col = idx % cols
    const jitterX = randInt(-18, 18)
    const jitterY = randInt(-18, 18)
    return {
      id: acc.id,
      position: { x: col * spacingX + jitterX, y: row * spacingY + jitterY },
      data: {
        label: acc.name.split(" ").slice(0, 3).join(" "),
        account: acc,
      },
      type: "accountNode",
    }
  })

  const first12Set = new Set(first12.map((a) => a.id))
  const graphEdges = transactions
    .filter((t) => first12Set.has(t.from) && first12Set.has(t.to))
    .filter((t) => t.status !== "normal") // keep edges focused on suspicious activity
    .map((t, idx) => {
      const isFlagged = t.status === "flagged"
      const isSuspicious = t.status === "suspicious"
      const stroke = isFlagged ? "#ff3860" : isSuspicious ? "#ffd000" : "#00e676"
      const animated = isFlagged ? true : false
      return {
        id: `e-${idx}-${t.id}`,
        source: t.from,
        target: t.to,
        animated,
        style: { stroke },
        data: { amount: t.amount, suspicious: isFlagged || isSuspicious },
      }
    })

  return { graphNodes: nodes, graphEdges }
}

function generateDynamicData() {
  // Ensure the list is always of length 20.
  if (ACCOUNT_BASE.length !== 20) {
    throw new Error("ACCOUNT_BASE must contain exactly 20 accounts.")
  }

  const suspiciousCount = randInt(5, 9)
  const suspiciousIds = new Set(sampleWithoutReplacement(ACCOUNT_IDS, suspiciousCount))

  const fraudTypePool: FraudType[] = [
    "circular_transaction",
    "structuring",
    "rapid_transfer",
    "velocity",
    "dormant_activation",
    "impossible_travel",
    "fan_out",
  ]

  // Randomly assign fraud types to suspicious accounts.
  const fraudByAccount: Partial<Record<string, FraudType>> = {}
  for (const id of suspiciousIds) {
    fraudByAccount[id] = pickOne(fraudTypePool)
  }

  const now = Date.now()
  const timeAnchorMs = now - randInt(1, 12) * 24 * 60 * 60 * 1000

  // Build accounts with per-session generated risk/last login fields.
  const accounts: Account[] = ACCOUNT_BASE.map((base) => {
    const isSuspicious = suspiciousIds.has(base.id)
    const riskScore = isSuspicious ? randInt(65, 99) : randInt(5, 38)

    const registeredCity = base.city

    // Last login geography:
    const shouldShowForeignLogin =
      isSuspicious && Math.random() < 0.6 && base.country !== "IN"
        ? true
        : isSuspicious && Math.random() < 0.35

    const lastLoginCity = shouldShowForeignLogin ? pickOne(FOREIGN_LOGIN_CITIES) : registeredCity
    const lastLoginIP = shouldShowForeignLogin ? pickOne(FOREIGN_IP_SEEDS) : base.ipAddress

    const assignedFraud = isSuspicious ? fraudByAccount[base.id] : undefined

    // Dormant activation needs lastActive > 6 months.
    let lastActive = base.lastActiveBase
    if (isSuspicious && assignedFraud === "dormant_activation") {
      lastActive = new Date(Date.now() - randInt(190, 420) * 24 * 60 * 60 * 1000).toISOString()
    }

    return {
      ...base,
      country: isSuspicious && base.type === "shell" ? base.country : "IN",
      riskScore,
      isSuspicious,
      lastLoginCity,
      lastLoginIP:
        shouldShowForeignLogin && lastLoginIP === base.ipAddress ? generateSimilarIpDifferent(base.ipAddress) : lastLoginIP,
      fraudType: assignedFraud,
      lastActive,
    }
  })

  // Transactions:
  // - add some normal traffic first (safe baseline)
  // - then add fraud-pattern transactions for suspicious accounts
  let txIdCounter = 1
  const baseNormalTxns = generateNormalTransactions({
    accounts,
    timeAnchorMs,
    startCounter: txIdCounter,
    countPerAccountRange: [1, 3],
  })
  txIdCounter += baseNormalTxns.length

  const suspiciousTransactions: Transaction[] = []
  for (const account of accounts) {
    if (!account.isSuspicious) continue
    const fraudType = account.fraudType || "velocity"

    const patternTxns = generateFraudTransactions({
      patternAccount: account,
      patternFraudType: fraudType,
      allAccounts: accounts,
      suspiciousAccountRiskScore: account.riskScore,
      timeAnchorMs,
      txIdStart: txIdCounter,
    })

    txIdCounter += patternTxns.length
    suspiciousTransactions.push(...patternTxns)
  }

  const transactions = [...baseNormalTxns, ...suspiciousTransactions]

  // Alerts:
  const alerts: Alert[] = []
  for (const account of accounts) {
    if (!account.isSuspicious) continue
    const fraudType = account.fraudType || "velocity"
    const mappedAlertType = mapFraudTypeToAlertType(fraudType)

    const openWeight = 0.6
    const investigatingWeight = 0.25
    const resolvedWeight = 1 - openWeight - investigatingWeight
    const r = Math.random()

    const status =
      r < openWeight ? "open" : r < openWeight + investigatingWeight ? "investigating" : "resolved"

    const reasons = generateReasons(fraudType, account)
    const reasonSlice = reasons.slice(0, randInt(2, 3))

    const patternTxn = suspiciousTransactions.find((t) => t.from === account.id && t.fraudType === fraudType) || suspiciousTransactions.find((t) => t.from === account.id)

    const description =
      `Account ${account.name} (${account.bank}) in ${account.city} flagged for ${fraudType.replace(/_/g, " ")}. ` +
      `RiskScore ${account.riskScore}% — ${reasonSlice[0]}`

    const id = `ALT${String(alerts.length + 1).padStart(3, "0")}`
    alerts.push({
      id,
      type: mappedAlertType,
      accountId: account.id,
      riskScore: account.riskScore,
      timestamp: patternTxn?.timestamp || new Date(timeAnchorMs).toISOString(),
      status,
      description,
      amount: patternTxn?.amount,
      reasons: reasonSlice,
      fraudType,
    })
  }

  // Dashboard stats:
  const suspiciousTxnCount = transactions.filter((t) => t.status !== "normal").length
  const totalTxCount = transactions.length
  const highRiskAccounts = accounts.filter((a) => a.riskScore >= 75).length
  const openAlerts = alerts.filter((a) => a.status === "open").length

  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0)
  const avgRiskScore = Math.round(transactions.reduce((sum, t) => sum + t.riskScore, 0) / Math.max(1, transactions.length))

  const stats: DashboardStats = {
    totalTransactions: totalTxCount + randInt(14000, 16000),
    suspiciousTransactions: suspiciousTxnCount + randInt(200, 280),
    highRiskAccounts,
    fraudAlerts: openAlerts,
    totalVolume,
    avgRiskScore,
  }

  const { transactionVolumeData, riskDistributionData, fraudVsNormalData } = generateChartData()
  const { graphNodes, graphEdges } = generateGraph({ accounts, transactions })

  return { accounts, transactions, alerts, stats, transactionVolumeData, riskDistributionData, fraudVsNormalData, graphNodes, graphEdges }
}

const dynamicData = generateDynamicData()

export const mockAccounts: Account[] = dynamicData.accounts
export const mockTransactions: Transaction[] = dynamicData.transactions
export const mockAlerts: Alert[] = dynamicData.alerts
export const mockDashboardStats: DashboardStats = dynamicData.stats

export const graphNodes = dynamicData.graphNodes
export const graphEdges = dynamicData.graphEdges

export const transactionVolumeData = dynamicData.transactionVolumeData
export const riskDistributionData = dynamicData.riskDistributionData
export const fraudVsNormalData = dynamicData.fraudVsNormalData

