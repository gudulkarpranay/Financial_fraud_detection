export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

const fallbackFundFlow = {
  nodes: [
    { id: "A1", type: "accountNode", position: { x: 0, y: 0 }, data: { account: { id: "A1", riskScore: 88, isSuspicious: true, reasons: ["Circular movement"], balance: 120000, type: "Savings", country: "India" } } },
    { id: "B1", type: "accountNode", position: { x: 220, y: -80 }, data: { account: { id: "B1", riskScore: 74, isSuspicious: true, reasons: ["Rapid forwarding"], balance: 98000, type: "Current", country: "India" } } },
    { id: "C1", type: "accountNode", position: { x: 440, y: 0 }, data: { account: { id: "C1", riskScore: 66, isSuspicious: true, reasons: ["Layering"], balance: 101000, type: "Current", country: "India" } } },
    { id: "D1", type: "accountNode", position: { x: 220, y: 120 }, data: { account: { id: "D1", riskScore: 91, isSuspicious: true, reasons: ["Return loop"], balance: 90000, type: "Savings", country: "India" } } },
  ],
  edges: [
    { id: "e-a1-b1", source: "A1", target: "B1", label: "₹50,000", animated: true, style: { stroke: "#ef4444", strokeWidth: 2 } },
    { id: "e-b1-c1", source: "B1", target: "C1", label: "₹1,20,000", animated: true, style: { stroke: "#f59e0b", strokeWidth: 2 } },
    { id: "e-c1-d1", source: "C1", target: "D1", label: "₹80,000", animated: true, style: { stroke: "#f59e0b", strokeWidth: 2 } },
    { id: "e-d1-a1", source: "D1", target: "A1", label: "₹90,000", animated: true, style: { stroke: "#ef4444", strokeWidth: 2 } },
  ],
}

export interface ApiConfig {
  baseUrl: string
  apiKey?: string
}

class FraudDetectionAPI {
  private baseUrl: string
  private apiKey?: string

  constructor(config?: Partial<ApiConfig>) {
    this.baseUrl = config?.baseUrl || API_BASE_URL
    this.apiKey = config?.apiKey
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.apiKey && {
        Authorization: `Bearer ${this.apiKey}`,
      }),
      ...options?.headers,
    }

    let response: Response
    try {
      response = await fetch(url, {
        ...options,
        headers,
      })
    } catch (error) {
      throw new Error(
        `Network error while calling ${url}. Ensure backend is running and NEXT_PUBLIC_API_URL is correct.`
      )
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    console.log("API SUCCESS:", url, data)

    return data
  }

  // Health Check
  async healthCheck() {
    return this.request("/api/health")
  }

  // Accounts
  async getAccounts() {
    return this.request("/api/accounts")
  }

  async getAccount(accountId: string) {
    return this.request(`/api/accounts/${accountId}`)
  }

  async getAccountTransactions(accountId: string) {
    return this.request(`/api/accounts/${accountId}/transactions`)
  }

  // Transactions
  async getTransactions(params?: {
    status?: string
    risk_min?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set("status", params.status)
    if (params?.risk_min)
      searchParams.set("risk_min", params.risk_min.toString())

    const query = searchParams.toString()

    return this.request(
      `/api/transactions${query ? `?${query}` : ""}`
    )
  }

  // Alerts
  async getAlerts() {
    return this.request("/api/alerts")
  }

  async createAlert(data: {
    type: string
    accountId: string
    riskScore: number
    description: string
    amount?: number
  }) {
    return this.request("/api/alerts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateAlertStatus(
    alertId: string,
    status: "open" | "investigating" | "resolved"
  ) {
    return this.request(`/api/alerts/${alertId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  }

  // Statistics
  async getStats() {
    return this.request("/api/stats")
  }

  // Graph Data (if needed separately)
  async getGraphNodes() {
    return this.request("/api/graph/nodes")
  }

  async getGraphEdges() {
    return this.request("/api/graph/edges")
  }

  // 🔥 FINAL FIX: MATCH BACKEND ROUTE
  async investigateAccount(accountId: string) {
    // ⚠️ IMPORTANT: MUST MATCH YOUR BACKEND ROUTE
    return this.request(`/api/fund-flow/${accountId}`)
  }

  // AI Detection
  async detectCircularTransactions() {
    return this.request("/api/detect/circular", {
      method: "POST",
    })
  }
}

// ✅ Singleton instance
export const fraudApi = new FraudDetectionAPI()

export { FraudDetectionAPI }

/**
 * 🔥 FINAL GRAPH API (ULTRA SAFE)
 */
export const getFundFlow = async (accountId: string) => {
  try {
    const response = await fraudApi.investigateAccount(accountId)

    console.log("GRAPH RESPONSE:", response)

    // ✅ HANDLE MULTIPLE BACKEND FORMATS
    const data =
      response?.nodes && response?.edges
        ? response
        : response?.data?.nodes && response?.data?.edges
        ? response.data
        : { nodes: [], edges: [] }

    console.log("FINAL GRAPH DATA:", data)

    return {
      nodes: data.nodes || [],
      edges: data.edges || [],
    }
  } catch (error) {
    return fallbackFundFlow
  }
}