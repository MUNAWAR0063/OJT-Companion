import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { AnalyticsContentNew } from "@/components/analytics/analytics-content-new"

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Competencies"
          description="Track your competency progress and learning across the 18-week program."
        />

        <div className="mt-8">
          <AnalyticsContentNew />
        </div>
      </main>
    </div>
  )
}
