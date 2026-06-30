"use client"

import { EmptyStateCard } from "@/components/shared/empty-state-card"
import { FileBarChart } from "lucide-react"

export function ReportsContentNew() {
  return (
    <EmptyStateCard
      icon={FileBarChart}
      title="No reports generated"
      description="Weekly summaries and progress reports will appear here once you've completed tasks and documented your learning."
      actionLabel="Generate Report"
      onAction={() => {}}
    />
  )
}
