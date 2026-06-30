import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { ComingSoon } from "@/components/shared/coming-soon"
import { FileText } from "lucide-react"

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
          <ComingSoon
            icon={FileText}
            title="Document hub coming soon"
            description="Organize single-line diagrams, P&IDs, maintenance procedures, and engineering standards in one searchable place."
          />
        </div>
      </main>
    </div>
  )
}
