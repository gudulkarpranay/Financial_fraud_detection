import { StatsCards } from "@/components/dashboard/stats-cards"
import { TransactionChart, RiskDistributionChart, FraudPieChart } from "@/components/dashboard/dashboard-charts"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"
import { RunDemoButton } from "@/components/ui/run-demo-button"
import FraudChatbot from "@/components/chat/fraud-chatbot"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">AI-powered real-time fraud detection</p>
        </div>
        <RunDemoButton />
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-4">
        <TransactionChart />
        <RiskDistributionChart />
        <FraudPieChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentAlerts />
        </div>
        <div className="lg:col-span-1">
          <FraudChatbot />
        </div>
      </div>
    </div>
  )
}
