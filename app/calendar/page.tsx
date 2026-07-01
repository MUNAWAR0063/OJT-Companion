import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { WeeklyPlannerInteractive } from "@/components/planner/weekly-planner-interactive"

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
        <Header
          title="Weekly Planner"
          description="Plan and track your weekly learning objectives, engineering tasks, equipment studies, and deliverables."
        />

        <PageBreadcrumb />

        <div className="mt-8">
          <WeeklyPlannerInteractive />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}


