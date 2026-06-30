import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { TasksContentNew } from "@/components/tasks/tasks-content-new"

export default function TasksPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Knowledge Base"
          description="Capture, organize, and master technical knowledge from field experience and training."
        />

        <div className="mt-8">
          <TasksContentNew />
        </div>
      </main>
    </div>
  )
}
