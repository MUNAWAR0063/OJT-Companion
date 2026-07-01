import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { HelpContent } from "@/components/help/help-content"

export default function HelpPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
        <Header
          title="Help & Support"
          description="Learn how to get the most out of your OJT Companion workspace."
        />

        <div className="mt-8">
          <HelpContent />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}


