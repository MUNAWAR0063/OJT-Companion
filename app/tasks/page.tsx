import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { KnowledgeBaseInteractive } from "@/components/tasks/knowledge-base-interactive"

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
        <Header
          title="Knowledge Base"
          description="Capture, organize, and master technical knowledge from field experience and training."
        />

        <PageBreadcrumb />

        <div className="mt-8">
          <KnowledgeBaseInteractive />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}


