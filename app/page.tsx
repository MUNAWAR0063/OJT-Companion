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

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <Header
          title="Dashboard"
          description="Your competency and learning progress overview for this OJT assignment."
        />

        <div className="mt-6 md:mt-8 space-y-5 md:space-y-6">
          <WelcomeCard />

          <LearningProgress />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
            <div className="lg:col-span-2 space-y-5 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <TodaysFocus />
                <CurrentLearning />
              </div>
              <EquipmentProgress />
              <RecentJournal />
            </div>

            <div className="space-y-5 md:space-y-6">
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
