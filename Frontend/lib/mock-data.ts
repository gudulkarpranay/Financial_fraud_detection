/**
 * Re-exports shared dashboard types.
 * Live data comes from GET /api/bootstrap via `DashboardDataProvider`.
 */
export type {
  FraudType,
  TransactionStatus,
  TransactionType,
  AlertType,
  Transaction,
  Account,
  Alert,
  DashboardStats,
} from "./types-dashboard"
