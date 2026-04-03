"use client"

import { API_BASE_URL } from "@/lib/api-service"

export interface BackendBootstrapData {
  accounts: any[]
  transactions: any[]
  alerts: any[]
  stats: any
  transactionVolumeData: any[]
  riskDistributionData: any[]
  fraudVsNormalData: any[]
  graphNodes: any[]
  graphEdges: any[]
}

export async function fetchBootstrapData(): Promise<BackendBootstrapData> {
  const res = await fetch(`${API_BASE_URL}/api/bootstrap`, { cache: "no-store" })
  if (!res.ok) throw new Error(`Bootstrap API failed: ${res.status}`)
  return res.json()
}

