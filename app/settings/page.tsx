import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { SettingsContent } from "@/components/settings/settings-content"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
        <Header
          title="Settings"
          description="Manage profile, appearance, language, backups, storage, and application data."
        />

        <PageBreadcrumb />

        <div className="mt-8">
          <SettingsContent />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}


