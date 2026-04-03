import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { DashboardDataProvider } from "@/contexts/dashboard-data-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardDataProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="ml-64">
          <TopNavbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </DashboardDataProvider>
  )
}
