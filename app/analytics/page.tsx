import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { AnalyticsContent } from "@/components/analytics/analytics-content"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Competencies"
          description="Track your competency progress and learning across the 18-week program."
          actions={
            <Button
              variant="outline"
              className="w-full sm:w-auto h-9 text-sm transition-all duration-300 hover:shadow-md hover:scale-105 bg-transparent gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          }
        />

        <div className="mt-8">
          <AnalyticsContent />
        </div>
      </main>
    </div>
  )
}
