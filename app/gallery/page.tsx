import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { GalleryInteractive } from "@/components/gallery/gallery-interactive"

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
          <GalleryInteractive />
        </div>
      </main>
    </div>
  )
}
