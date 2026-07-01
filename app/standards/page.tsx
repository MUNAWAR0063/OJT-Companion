import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { StandardsLibrary } from "@/components/standards/standards-library"

export default function StandardsPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
        <Header
          title="Standards Library"
          description="Organize IEC, IEEE, NFPA, API, ISA, NEMA, and company engineering standards."
        />

        <PageBreadcrumb />

        <div className="mt-8">
          <StandardsLibrary />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}


