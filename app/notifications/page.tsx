import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { NotificationsInteractive } from "@/components/notifications/notifications-interactive"

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
        <Header
          title="Notification Center"
          description="Manage reminders, deadlines, incomplete checklists, and learning notifications."
        />

        <PageBreadcrumb />

        <div className="mt-8">
          <NotificationsInteractive />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}


