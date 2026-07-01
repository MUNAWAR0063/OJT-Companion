import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { AnalyticsContentDynamic } from "@/components/analytics/analytics-content-dynamic"

export default function CompetenciesPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
          <Header
            title="Competencies"
            description="Track your competency progress and learning across the 18-week program."
          />

          <PageBreadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Competencies" }]} />

          <div className="mt-8">
            <AnalyticsContentDynamic />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
