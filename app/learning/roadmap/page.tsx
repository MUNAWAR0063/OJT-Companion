import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { RoadmapContentNew } from "@/components/learning/roadmap-content-new"

export default function LearningRoadmapPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
        <Header
          title="Learning Roadmap"
          description="Map out competency milestones across the 18-week training program."
        />

        <PageBreadcrumb />

        <div className="mt-8">
          <RoadmapContentNew />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}


