import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { RoadmapContentNew } from "@/components/learning/roadmap-content-new"

export default function LearningRoadmapPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Learning Roadmap"
          description="Map out competency milestones across the 18-week training program."
        />

        <div className="mt-8">
          <RoadmapContentNew />
        </div>
      </main>
    </div>
  )
}
