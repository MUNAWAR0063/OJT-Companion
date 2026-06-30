import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { EquipmentLibraryContent } from "@/components/equipment/equipment-library-content"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function EquipmentLibraryPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Equipment Library"
          description="Catalog transformers, switchgear, motors, and protection devices you study on site."
          actions={
            <Button className="gap-2 w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30">
              <Plus className="w-4 h-4" />
              Add Equipment
            </Button>
          }
        />

        <div className="mt-8">
          <EquipmentLibraryContent />
        </div>
      </main>
    </div>
  )
}
