import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { FieldNotesInteractive } from "@/components/team/field-notes-interactive"

export default function TeamPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb />

        <Header
          title="Field Notes"
          description="Document daily field observations, lessons learned, and site notes."
        />

        <div className="mt-8">
          <FieldNotesInteractive />
        </div>
      </main>
    </div>
  )
}
