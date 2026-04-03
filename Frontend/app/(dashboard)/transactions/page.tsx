"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDashboardData } from "@/contexts/dashboard-data-context"
import type { Transaction } from "@/lib/types-dashboard"
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const statusConfig: Record<
  Transaction["status"],
  { icon: typeof CheckCircle; label: string; color: string }
> = {
  normal: { icon: CheckCircle, label: "Normal", color: "bg-success/10 text-success" },
  suspicious: { icon: AlertCircle, label: "Suspicious", color: "bg-warning/10 text-warning" },
  flagged: { icon: AlertTriangle, label: "Flagged", color: "bg-destructive/10 text-destructive" },
}

const typeLabels: Record<Transaction["type"], string> = {
  UPI: "UPI",
  NEFT: "NEFT",
  IMPS: "IMPS",
  RTGS: "RTGS",
}

export default function TransactionsPage() {
  const { loading, error, data } = useDashboardData()
  const mockTransactions = data?.transactions ?? []

  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTransactions = mockTransactions.filter((txn: Transaction) => {
    if (statusFilter !== "all" && txn.status !== statusFilter) return false
    if (typeFilter !== "all" && txn.type !== typeFilter) return false
    if (
      searchQuery &&
      !txn.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !txn.from.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !txn.to.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const totalVolume = mockTransactions.reduce((sum, txn) => sum + txn.amount, 0)
  const suspiciousCount = mockTransactions.filter((t) => t.status !== "normal").length
  const avgRisk =
    mockTransactions.length > 0
      ? Math.round(
          mockTransactions.reduce((sum, txn) => sum + txn.riskScore, 0) / mockTransactions.length
        )
      : 0

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">Loading transactions…</p>
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
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
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground">Monitor and analyze all financial transactions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold text-card-foreground">
              ₹{totalVolume.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Transaction Count</p>
            <p className="text-2xl font-bold text-card-foreground">
              {mockTransactions.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Suspicious/Flagged</p>
            <p className="text-2xl font-bold text-warning">{suspiciousCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Risk Score</p>
            <p className="text-2xl font-bold text-card-foreground">{avgRisk}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, sender, or receiver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="NEFT">NEFT</SelectItem>
                  <SelectItem value="IMPS">IMPS</SelectItem>
                  <SelectItem value="RTGS">RTGS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Transaction List</CardTitle>
          <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Transaction ID</TableHead>
                <TableHead className="text-muted-foreground">From → To</TableHead>
                <TableHead className="text-muted-foreground">
                  <div className="flex items-center gap-1">
                    Amount
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Risk Score</TableHead>
                <TableHead className="text-muted-foreground">Time</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((txn) => {
                const StatusIcon = statusConfig[txn.status].icon
                return (
                  <TableRow key={txn.id} className="border-border">
                    <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-sm">
                        <span>{txn.from}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span>{txn.to}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{txn.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[txn.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            txn.riskScore >= 80
                              ? "bg-destructive"
                              : txn.riskScore >= 60
                              ? "bg-warning"
                              : "bg-success"
                          )}
                        />
                        <span
                          className={cn(
                            "font-medium",
                            txn.riskScore >= 80
                              ? "text-destructive"
                              : txn.riskScore >= 60
                              ? "text-warning"
                              : "text-foreground"
                          )}
                        >
                          {txn.riskScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(txn.timestamp).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1", statusConfig[txn.status].color)}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[txn.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
