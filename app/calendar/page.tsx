import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { WeeklyPlannerNew } from "@/components/planner/weekly-planner-new"

export default function CalendarPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Weekly Planner"
          description="Plan and track your weekly learning objectives, engineering tasks, equipment studies, and deliverables."
        />

        <div className="mt-8">
          <WeeklyPlannerNew />
        </div>
      </main>
    </div>
  )
}
