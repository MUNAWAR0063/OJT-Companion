import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { ComingSoon } from "@/components/shared/coming-soon"
import { Images } from "lucide-react"

export default function PhotoGalleryPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Project Gallery"
          description="Document field observations with annotated site and equipment photos."
        />

        <div className="mt-8">
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
