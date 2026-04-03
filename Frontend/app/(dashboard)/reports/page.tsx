"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDashboardData } from "@/contexts/dashboard-data-context"
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  PieChart,
  FileDown,
  Printer,
} from "lucide-react"
import { cn } from "@/lib/utils"

const reportTypes = [
  {
    id: "executive",
    name: "Executive Summary",
    description: "High-level overview for leadership",
    icon: TrendingUp,
  },
  {
    id: "suspicious",
    name: "Suspicious Activity Report",
    description: "Detailed SAR documentation",
    icon: AlertTriangle,
  },
  {
    id: "account",
    name: "Account Analysis",
    description: "Individual account risk breakdown",
    icon: Users,
  },
  {
    id: "transaction",
    name: "Transaction Report",
    description: "Transaction flow analysis",
    icon: DollarSign,
  },
]

export default function ReportsPage() {
  const { loading, error, data } = useDashboardData()
  const mockAccounts = data?.accounts ?? []
  const mockAlerts = data?.alerts ?? []
  const mockDashboardStats = data?.stats

  const [selectedReport, setSelectedReport] = useState("executive")
  const [dateRange, setDateRange] = useState("7d")

  const suspiciousAccounts = mockAccounts.filter((a) => a.isSuspicious)
  const openAlerts = mockAlerts.filter((a) => a.status === "open")

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Loading report data…</p>
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (error || !mockDashboardStats) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-destructive">
        {error || "Could not load report data."}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download compliance and analysis reports
        </p>
      </div>

      {/* Report Type Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary",
              selectedReport === report.id && "border-primary bg-primary/5"
            )}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardContent className="flex items-start gap-4 p-4">
              <div
                className={cn(
                  "rounded-lg p-2",
                  selectedReport === report.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <report.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-card-foreground">{report.name}</h3>
                <p className="text-xs text-muted-foreground">{report.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Configuration */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Report Configuration</CardTitle>
              <CardDescription>Customize your report parameters</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button className="gap-2" onClick={() => window.print()}>
              <FileDown className="h-4 w-4" />
              Download / Print Report
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => {
              const el = document.getElementById("report-preview")
              if (el) {
                const w = window.open("", "_blank")
                if (w) {
                  w.document.write("<html><head><title>FraudShield Report</title></head><body>" + el.innerHTML + "</body></html>")
                  w.document.close()
                  w.print()
                }
              }
            }}>
              <Printer className="h-4 w-4" />
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-card-foreground">
                {reportTypes.find((r) => r.id === selectedReport)?.name} Preview
              </CardTitle>
            </div>
            <Badge variant="outline">Preview Mode</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div id="report-preview" className="rounded-lg border border-border bg-muted/30 p-6 space-y-6">
            {/* Report Header */}
            <div className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">
                    FraudShield - {reportTypes.find((r) => r.id === selectedReport)?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Generated on {new Date().toLocaleDateString()} | Period: Last{" "}
                    {dateRange === "24h" ? "24 hours" : dateRange === "7d" ? "7 days" : dateRange === "30d" ? "30 days" : "90 days"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Report ID</p>
                  <p className="font-mono text-sm">RPT-{Date.now().toString().slice(-8)}</p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Executive Summary
              </h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-card p-4 border border-border">
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {mockDashboardStats.totalTransactions.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-card p-4 border border-border">
                  <p className="text-sm text-muted-foreground">Suspicious Activity</p>
                  <p className="text-2xl font-bold text-warning">
                    {mockDashboardStats.suspiciousTransactions}
                  </p>
                </div>
                <div className="rounded-lg bg-card p-4 border border-border">
                  <p className="text-sm text-muted-foreground">High-Risk Accounts</p>
                  <p className="text-2xl font-bold text-destructive">
                    {suspiciousAccounts.length}
                  </p>
                </div>
                <div className="rounded-lg bg-card p-4 border border-border">
                  <p className="text-sm text-muted-foreground">Open Alerts</p>
                  <p className="text-2xl font-bold text-destructive">{openAlerts.length}</p>
                </div>
              </div>
            </div>

            {/* High Risk Accounts */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                High-Risk Accounts
              </h3>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Account ID
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Country
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Risk Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {suspiciousAccounts.slice(0, 5).map((account) => (
                      <tr key={account.id} className="border-t border-border">
                        <td className="px-4 py-2 font-mono">{account.id}</td>
                        <td className="px-4 py-2">{account.name}</td>
                        <td className="px-4 py-2 capitalize">{account.type}</td>
                        <td className="px-4 py-2">{account.country}</td>
                        <td className="px-4 py-2">
                          <span className="text-destructive font-semibold">
                            {account.riskScore}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Alerts */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Recent Fraud Alerts
              </h3>
              <div className="space-y-3">
                {mockAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-lg bg-card p-4 border border-border flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-card-foreground">
                          {alert.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <Badge
                          variant={
                            alert.status === "open"
                              ? "destructive"
                              : alert.status === "investigating"
                              ? "default"
                              : "secondary"
                          }
                          className={cn(
                            "text-xs",
                            alert.status === "investigating" && "bg-warning text-warning-foreground"
                          )}
                        >
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-destructive">
                        Risk: {alert.riskScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
              <p>
                This report is generated by FraudShield AI Detection System. For questions, contact
                compliance@fraudshield.ai
              </p>
              <p className="mt-1">
                Confidential - Internal Use Only | Page 1 of 1
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
