import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { WelcomeCard } from "@/components/dashboard/welcome-card"
import { LearningProgress } from "@/components/dashboard/learning-progress"
import { TodaysFocus } from "@/components/dashboard/todays-focus"
import { CurrentLearning } from "@/components/dashboard/current-learning"
import { WeeklyPlanner } from "@/components/dashboard/weekly-planner"
import { EquipmentProgress } from "@/components/dashboard/equipment-progress"
import { RecentJournal } from "@/components/dashboard/recent-journal"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 p-3 md:p-4 lg:p-5 lg:ml-64">
        <Header
          title="Dashboard"
          description="Your engineering learning overview for this OJT trip."
        />

        <div className="mt-4 md:mt-5 space-y-3 md:space-y-4">
          <WelcomeCard />

          <LearningProgress />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <TodaysFocus />
                <CurrentLearning />
              </div>
              <EquipmentProgress />
              <RecentJournal />
            </div>

            <div className="space-y-3 md:space-y-4">
              <QuickActions />
              <WeeklyPlanner />
              <RecentDocuments />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
