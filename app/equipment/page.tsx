import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { EquipmentLibraryInteractive } from "@/components/equipment/equipment-library-interactive"

export default function EquipmentLibraryPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Equipment Library"
          description="Catalog transformers, switchgear, motors, and protection devices you study on site."
        />

        <div className="mt-8">
          <EquipmentLibraryInteractive />
        </div>
      </main>
    </div>
  )
}
