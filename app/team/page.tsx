import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { FieldNotesInteractive } from "@/components/team/field-notes-interactive"

export default function TeamPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
        <Header
          title="Daily Journal"
          description="Document daily activities, lessons, problems, questions, equipment, and reflections."
        />

        <PageBreadcrumb />

        <div className="mt-8">
          <FieldNotesInteractive />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}


