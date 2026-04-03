"use client"

import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/api-service"

import { useState, Fragment } from "react"
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
import type { Alert } from "@/lib/types-dashboard"
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"

const alertTypeLabels: Record<Alert["type"], string> = {
  circular_transaction: "Circular Transaction",
  rapid_transfer: "Rapid Transfer",
  structuring: "Structuring",
  velocity: "Velocity Anomaly",
  dormant_activation: "Dormant Activation",
}

const statusConfig = {
  open: {
    icon: AlertTriangle,
    label: "Open",
    color: "bg-destructive text-destructive-foreground",
  },
  investigating: {
    icon: RefreshCw,
    label: "Investigating",
    color: "bg-warning text-warning-foreground",
  },
  resolved: {
    icon: CheckCircle2,
    label: "Resolved",
    color: "bg-success text-success-foreground",
  },
}

const typeAnalysis: Record<Alert["type"], { findings: string[]; actions: string[] }> = {
  circular_transaction: {
    findings: [
      "Funds appear to move in a loop across linked accounts.",
      "Pattern is consistent with circular laundering behavior.",
    ],
    actions: [
      "Temporarily hold high-value outgoing transactions.",
      "Run beneficiary linkage and KYC re-verification.",
    ],
  },
  rapid_transfer: {
    findings: [
      "Multiple hops were executed in a short time window.",
      "Velocity suggests layering or quick dispersal attempt.",
    ],
    actions: [
      "Apply step-up verification on the source account.",
      "Review related accounts for synchronized transfers.",
    ],
  },
  structuring: {
    findings: [
      "Transactions are split into threshold-avoiding amounts.",
      "Structuring pattern indicates deliberate reporting evasion.",
    ],
    actions: [
      "Aggregate linked transfers for compliance review.",
      "Escalate for AML analyst investigation.",
    ],
  },
  velocity: {
    findings: [
      "Transaction frequency is abnormally high for this profile.",
      "Behavior deviates from historical account baseline.",
    ],
    actions: [
      "Apply temporary velocity limits.",
      "Trigger enhanced monitoring for 24 hours.",
    ],
  },
  dormant_activation: {
    findings: [
      "Previously inactive account became suddenly active.",
      "Activation followed by high-value movement is suspicious.",
    ],
    actions: [
      "Force re-authentication and profile confirmation.",
      "Hold suspicious transfers pending analyst approval.",
    ],
  },
}

export default function AlertsPage() {
  const { loading, error, data } = useDashboardData()
  const mockAlerts = data?.alerts ?? []

  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)

  const sendEmail = async (alert: Alert) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: alert.email, alertData: alert })
      });
      if (res.ok) toast.success("Email sent successfully!");
      else toast.error("Failed to send email");
    } catch(e) {
      toast.error("Error sending email");
    }
  }

  const filteredAlerts = mockAlerts.filter((alert: Alert) => {
    if (statusFilter !== "all" && alert.status !== statusFilter) return false
    if (riskFilter === "high" && alert.riskScore < 70) return false
    if (riskFilter === "medium" && (alert.riskScore < 40 || alert.riskScore >= 70)) return false
    if (riskFilter === "low" && alert.riskScore >= 40) return false
    if (
      searchQuery &&
      !alert.accountId.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fraud Alerts</h1>
          <p className="text-muted-foreground">Loading alerts…</p>
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fraud Alerts</h1>
        <p className="text-muted-foreground">
          Monitor and manage detected suspicious activities
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alert List</CardTitle>
          <CardDescription>
            {filteredAlerts.length} alerts found
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAlerts.map((alert) => {
                const StatusIcon = statusConfig[alert.status].icon
                const isOpen = expandedAlert === alert.id
                const fallbackFindings = typeAnalysis[alert.type].findings
                const fallbackActions = typeAnalysis[alert.type].actions
                const findings =
                  alert.reasons?.length && alert.reasons.length > 0
                    ? alert.reasons
                    : fallbackFindings

                return (
                  <Fragment key={alert.id}>
                    {/* Main Row */}
                    <TableRow>
                      <TableCell>{alert.id}</TableCell>
                      <TableCell>{alert.accountId}</TableCell>

                      <TableCell>
                        <span
                          className={cn(
                            alert.riskScore > 70
                              ? "text-red-500"
                              : alert.riskScore > 40
                              ? "text-yellow-500"
                              : "text-green-500"
                          )}
                        >
                          {alert.riskScore}%
                        </span>
                      </TableCell>

                      <TableCell>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </TableCell>

                      <TableCell>
                        <Badge className={statusConfig[alert.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {alert.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setExpandedAlert(isOpen ? null : alert.id)
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {isOpen ? "Hide" : "View"}
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row */}
                    {isOpen && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="p-4 bg-muted rounded-lg space-y-2 relative">
                            <div className="absolute top-4 right-4">
                              <Button size="sm" variant="outline" onClick={() => sendEmail(alert)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email Warning
                              </Button>
                            </div>
                            <p className="font-semibold text-sm">
                              🚨 Fraud Analysis
                            </p>
                            <ul className="text-sm space-y-1">
                              {findings.map((r, i) => (
                                <li key={i}>⚠ {r}</li>
                              ))}
                            </ul>
                            <p className="font-semibold text-sm pt-2">
                              Recommended Actions
                            </p>
                            <ul className="text-sm space-y-1">
                              {fallbackActions.map((action, i) => (
                                <li key={i}>- {action}</li>
                              ))}
                            </ul>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}