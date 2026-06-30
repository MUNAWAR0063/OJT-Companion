import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ComingSoon } from "@/components/shared/coming-soon"
import { CircuitBoard } from "lucide-react"

export default function EquipmentLibraryPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-6 lg:ml-64">
        <Header
          title="Equipment Library"
          description="Catalog transformers, switchgear, motors, and protection devices you study on site."
        />

        <div className="mt-6">
          <ComingSoon
            icon={CircuitBoard}
            title="Equipment catalog coming soon"
            description="Build a reference library of electrical equipment with ratings, nameplate data, and field notes captured during your OJT."
          />
        </div>
      </main>
    </div>
  )
}
