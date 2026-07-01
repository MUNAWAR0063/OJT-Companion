import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { ReportsInteractive } from "@/components/reports/reports-interactive"

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
        <Header
          title="Reports"
          description="Generate weekly, trip, equipment, and knowledge reports with PDF and Markdown export."
        />

        <PageBreadcrumb />

        <div className="mt-8">
          <ReportsInteractive />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}


