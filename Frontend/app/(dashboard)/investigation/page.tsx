"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useDashboardData } from "@/contexts/dashboard-data-context"
import type { Account, Transaction } from "@/lib/types-dashboard"
import {
  Search,
  Network,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Clock,
  MapPin,
  Building2,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import { cn } from "@/lib/utils"
import PathTracer from "@/components/investigation/path_tracer"
import TransactionTimeline from "@/components/investigation/transaction_timeline"
import FraudChatbot from "@/components/chat/fraud-chatbot"

export default function InvestigationPage() {
  const { loading: dataLoading, error, data } = useDashboardData()
  const mockAccounts = data?.accounts ?? []
  const mockTransactions = data?.transactions ?? []

  const [accountId, setAccountId] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [relatedTransactions, setRelatedTransactions] = useState<Transaction[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (id?: string) => {
    const searchId = id || accountId
    if (!searchId.trim()) return

    setIsSearching(true)
    setTimeout(() => {
      const account = mockAccounts.find(
        (a) => a.id.toLowerCase() === searchId.toLowerCase()
      )
      setSelectedAccount(account || null)
      if (account) {
        const transactions = mockTransactions.filter(
          (t) => t.from === account.id || t.to === account.id
        )
        setRelatedTransactions(transactions)
      } else {
        setRelatedTransactions([])
      }
      setIsSearching(false)
    }, 500)
  }

  if (dataLoading && !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investigation Mode</h1>
          <p className="text-muted-foreground">Loading accounts…</p>
        </div>
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Investigation Mode</h1>
        <p className="text-muted-foreground">Deep dive into account activity and trace fund flows</p>
      </div>

      {/* Search */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Search className="h-5 w-5" />
            Account Investigation
          </CardTitle>
          <CardDescription>Enter an Account ID to trace transactions and detect fraud patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter Account ID (e.g., ACC001)"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="max-w-md"
            />
            <Button onClick={() => handleSearch()} disabled={isSearching}>
              {isSearching ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Searching...
                </>
              ) : (
                <>
                  <Network className="mr-2 h-4 w-4" />
                  Trace Fund Flow
                </>
              )}
            </Button>
          </div>

          {/* Quick access suspicious accounts */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Quick access — suspicious accounts:</p>
            <div className="flex flex-wrap gap-2">
              {mockAccounts
                .filter((a) => a.isSuspicious)
                .slice(0, 5)
                .map((account) => (
                  <Button
                    key={account.id}
                    variant="outline"
                    size="sm"
                    className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setAccountId(account.id)
                      handleSearch(account.id)
                    }}
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {account.id}
                  </Button>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {selectedAccount && (
        <>
          {/* Top row — Account Profile + Risk Analysis */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Account Profile */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground">Account Profile</CardTitle>
                  <Badge
                    variant={selectedAccount.isSuspicious ? "destructive" : "default"}
                    className={cn(!selectedAccount.isSuspicious && "bg-success text-success-foreground")}
                  >
                    {selectedAccount.isSuspicious ? (
                      <><AlertTriangle className="mr-1 h-3 w-3" />Suspicious</>
                    ) : (
                      <><CheckCircle className="mr-1 h-3 w-3" />Normal</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Account ID</p>
                  <p className="font-mono text-lg font-semibold text-card-foreground">{selectedAccount.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold text-card-foreground">{selectedAccount.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Type
                    </p>
                    <p className="font-medium capitalize text-card-foreground">{selectedAccount.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Country
                    </p>
                    <p className="font-medium text-card-foreground">{selectedAccount.country}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Balance
                  </p>
                  <p className="text-2xl font-bold text-card-foreground">
                    ₹{selectedAccount.balance.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-card-foreground">{selectedAccount.createdAt}</p>
                </div>
              </CardContent>
            </Card>

            {/* Risk Analysis */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <TrendingUp className="h-5 w-5" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className={cn(
                    "mx-auto flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold",
                    selectedAccount.riskScore >= 75 ? "bg-destructive/20 text-destructive" :
                    selectedAccount.riskScore >= 50 ? "bg-warning/20 text-warning" :
                    "bg-success/20 text-success"
                  )}>
                    {selectedAccount.riskScore}
                  </div>
                  <p className="mt-2 text-lg font-medium text-card-foreground">Risk Score</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAccount.riskScore >= 75 ? "Critical — Immediate review required" :
                     selectedAccount.riskScore >= 50 ? "High — Investigation recommended" :
                     "Low — Normal activity"}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaction Count</span>
                    <span className="font-medium text-card-foreground">{selectedAccount.transactionCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Account Age</span>
                    <span className="font-medium text-card-foreground">
                      {Math.floor((Date.now() - new Date(selectedAccount.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
                {selectedAccount.isSuspicious && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 space-y-1">
                    <p className="text-sm font-medium text-destructive">Risk Factors:</p>
                    {selectedAccount.type === "shell" && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Shell company structure
                      </p>
                    )}
                    {selectedAccount.country !== "IN" && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Offshore jurisdiction ({selectedAccount.country})
                      </p>
                    )}
                    {selectedAccount.transactionCount < 50 && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Low transaction history — new account
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Chatbot */}
            <FraudChatbot account={selectedAccount} />
          </div>

          {/* Bottom row — Path Tracer + Timeline */}
          <div className="grid gap-6 lg:grid-cols-2">
            <PathTracer />
            <TransactionTimeline
              transactions={relatedTransactions as any}
              accountId={selectedAccount.id}
            />
          </div>
        </>
      )}

      {/* No results */}
      {accountId && !selectedAccount && !isSearching && (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-card-foreground">Account Not Found</h3>
            <p className="text-muted-foreground">No account found with ID "{accountId}". Try ACC001 to ACC020.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
