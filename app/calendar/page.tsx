import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { WeeklyPlannerContent } from "@/components/planner/weekly-planner-content"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function CalendarPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Weekly Planner"
          description="Plan and track your weekly learning objectives, engineering tasks, equipment studies, and deliverables."
          actions={
            <Button className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          }
        />

        <div className="mt-8">
          <WeeklyPlannerContent />
        </div>
      </main>
    </div>
  )
}
