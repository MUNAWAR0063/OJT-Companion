import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { NotificationsInteractive } from "@/components/notifications/notifications-interactive"

export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Activity Feed"
          description="View your recent weekly plans, equipment entries, documents, and other activities."
        />

        <div className="mt-8">
          <NotificationsInteractive />
        </div>
      </main>
    </div>
  )
}
