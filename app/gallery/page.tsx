import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { GalleryInteractive } from "@/components/gallery/gallery-interactive"

export default function PhotoGalleryPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
        <Header
          title="Photo Gallery"
          description="Build a visual engineering record linked to equipment and daily journal entries."
        />

        <PageBreadcrumb />

        <div className="mt-8">
          <GalleryInteractive />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}


