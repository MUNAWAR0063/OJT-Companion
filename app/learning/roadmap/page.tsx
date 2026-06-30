import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { ComingSoon } from "@/components/shared/coming-soon"
import { Map } from "lucide-react"

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
          <ComingSoon
            icon={Map}
            title="Roadmap in progress"
            description="Your structured path through power systems, instrumentation, safety, and reliability will appear here, broken down by training phase and target competency."
          />
        </div>
      </main>
    </div>
  )
}
