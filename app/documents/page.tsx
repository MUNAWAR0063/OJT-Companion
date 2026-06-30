import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { DocumentsInteractive } from "@/components/documents/documents-interactive"

export default function DocumentsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Standards & Documentation"
          description="Access single-line diagrams, datasheets, procedures, and engineering standards for field reference."
        />

        <div className="mt-8">
          <DocumentsInteractive />
        </div>
      </main>
    </div>
  )
}
