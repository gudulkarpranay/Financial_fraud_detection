"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { API_BASE_URL } from "@/lib/api-service"
import type {
  Account,
  Alert,
  DashboardStats,
  Transaction,
} from "@/lib/types-dashboard"

export type ChartVolumeRow = {
  date: string
  transactions: number
  suspicious: number
  volume: number
}

export type RiskDistributionRow = { risk: string; count: number; fill: string }

export type FraudVsNormalRow = { name: string; value: number; fill: string }

export type GraphNode = {
  id: string
  type?: string
  position: { x: number; y: number }
  data?: { label?: string; account?: Account }
}

export type GraphEdge = {
  id: string
  source: string
  target: string
  animated?: boolean
  style?: { stroke?: string; strokeWidth?: number }
  data?: { amount?: number; suspicious?: boolean }
  label?: string
}

export type BootstrapPayload = {
  accounts: Account[]
  transactions: Transaction[]
  alerts: Alert[]
  stats: DashboardStats
  transactionVolumeData: ChartVolumeRow[]
  riskDistributionData: RiskDistributionRow[]
  fraudVsNormalData: FraudVsNormalRow[]
  graphNodes: GraphNode[]
  graphEdges: GraphEdge[]
}

type Ctx = {
  loading: boolean
  error: string | null
  data: BootstrapPayload | null
  refetch: () => Promise<void>
}

const DashboardDataContext = createContext<Ctx | null>(null)

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<BootstrapPayload | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/bootstrap`, { cache: "no-store" })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || `HTTP ${res.status}`)
      }
      const json = (await res.json()) as BootstrapPayload
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return (
    <DashboardDataContext.Provider value={{ loading, error, data, refetch }}>
      {children}
    </DashboardDataContext.Provider>
  )
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext)
  if (!ctx) {
    throw new Error("useDashboardData must be used within DashboardDataProvider")
  }
  return ctx
}
