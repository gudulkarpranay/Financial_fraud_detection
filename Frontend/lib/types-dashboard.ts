/** Shared types for dashboard + backend bootstrap payload */

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
  lastLoginCity?: string
  lastLoginIP?: string
  lastActive?: string
  fraudType?: FraudType
  email?: string
}

export interface Alert {
  id: string
  type: AlertType
  accountId: string
  riskScore: number
  timestamp: string
  status: "open" | "investigating" | "resolved"
  description: string
  amount?: number
  reasons?: string[]
  fraudType?: FraudType
  email?: string
}

export interface DashboardStats {
  totalTransactions: number
  suspiciousTransactions: number
  highRiskAccounts: number
  fraudAlerts: number
  totalVolume: number
  avgRiskScore: number
}
