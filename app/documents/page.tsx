import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { DocumentsInteractive } from "@/components/documents/documents-interactive"

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
        <Header
          title="Documents"
          description="Access single-line diagrams, datasheets, procedures, manuals, and engineering files."
        />

        <PageBreadcrumb />

        <div className="mt-8">
          <DocumentsInteractive />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}


