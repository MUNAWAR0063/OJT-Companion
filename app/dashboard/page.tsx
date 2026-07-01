import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { SprintDashboard } from "@/components/dashboard/sprint-dashboard"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
          <Header
            title="Dashboard"
            description="Your competency and learning progress overview for this OJT assignment."
          />

          <div className="mt-8 md:mt-10">
            <SprintDashboard />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
