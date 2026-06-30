import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ComingSoon } from "@/components/shared/coming-soon"
import { Images } from "lucide-react"

export default function PhotoGalleryPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-6 lg:ml-64">
        <Header
          title="Photo Gallery"
          description="Document field observations with annotated site and equipment photos."
        />

        <div className="mt-6">
          <ComingSoon
            icon={Images}
            title="Gallery coming soon"
            description="Capture and annotate photos of installations, wiring, and field conditions to support your daily journal entries."
          />
        </div>
      </main>
    </div>
  )
}
