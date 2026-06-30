import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { TasksContent } from "@/components/tasks/tasks-content"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function TasksPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Knowledge Base"
          description="Capture, organize, and master technical knowledge from field experience and training."
          actions={
            <Button className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 gap-2">
              <Plus className="w-4 h-4" />
              Add Lesson Learned
            </Button>
          }
        />

        <div className="mt-8">
          <TasksContent />
        </div>
      </main>
    </div>
  )
}
