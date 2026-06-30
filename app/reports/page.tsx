import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ComingSoon } from "@/components/shared/coming-soon"
import { FileBarChart } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-6 lg:ml-64">
        <Header
          title="Reports"
          description="Generate weekly summaries and progress reports for your supervisor."
        />

        <div className="mt-6">
          <ComingSoon
            icon={FileBarChart}
            title="Reporting coming soon"
            description="Compile weekly learning summaries, competency progress, and field hours into shareable reports for mentor review."
          />
        </div>
      </main>
    </div>
  )
}
