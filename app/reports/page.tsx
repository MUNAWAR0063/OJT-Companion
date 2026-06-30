import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { ReportsContentNew } from "@/components/reports/reports-content-new"

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Reports"
          description="Generate weekly summaries and progress reports for your supervisor."
        />

        <div className="mt-8">
          <ReportsContentNew />
        </div>
      </main>
    </div>
  )
}
