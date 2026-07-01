import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { EquipmentLibraryNew } from "@/components/equipment/equipment-library-new"

export default function EquipmentLibraryPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
        <Header
          title="Equipment Library"
          description="Catalog transformers, switchgear, motors, and protection devices you study on site."
        />

        <PageBreadcrumb />

        <div className="mt-8">
          <EquipmentLibraryNew />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}


