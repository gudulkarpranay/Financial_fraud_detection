"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockAlerts } from "@/lib/mock-data"
import { AlertTriangle, RefreshCw, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const alertTypeIcons = {
  circular_transaction: "Circular",
  rapid_transfer: "Rapid",
  structuring: "Structuring",
  velocity: "Velocity",
  dormant_activation: "Dormant",
}

const statusConfig = {
  open: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  investigating: { icon: RefreshCw, color: "text-warning", bg: "bg-warning/10" },
  resolved: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
}

const alertTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  timeZone: "UTC",
})

export function RecentAlerts() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground">Recent Fraud Alerts</CardTitle>
            <CardDescription>Latest detected suspicious activities</CardDescription>
          </div>
          <Badge variant="destructive" className="text-sm">
            {mockAlerts.filter((a) => a.status === "open").length} Open
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockAlerts.slice(0, 5).map((alert) => {
            const StatusIcon = statusConfig[alert.status].icon
            return (
              <div
                key={alert.id}
                className="flex items-start justify-between rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:bg-muted"
              >
                <div className="flex gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      statusConfig[alert.status].bg
                    )}
                  >
                    <StatusIcon className={cn("h-5 w-5", statusConfig[alert.status].color)} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-card-foreground">
                        {alertTypeIcons[alert.type]} Transaction Alert
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          alert.riskScore >= 80
                            ? "border-destructive text-destructive"
                            : alert.riskScore >= 60
                            ? "border-warning text-warning"
                            : "border-muted-foreground"
                        )}
                      >
                        Risk: {alert.riskScore}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Account: {alert.accountId}</span>
                      {alert.amount && <span>Amount: ₹{alert.amount.toLocaleString("en-IN")}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={
                      alert.status === "open"
                        ? "destructive"
                        : alert.status === "investigating"
                        ? "default"
                        : "secondary"
                    }
                    className={cn(
                      alert.status === "investigating" && "bg-warning text-warning-foreground",
                      alert.status === "resolved" && "bg-success text-success-foreground"
                    )}
                  >
                    {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {alertTimeFormatter.format(new Date(alert.timestamp))}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
