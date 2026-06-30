"use client"

import { EmptyStateCard } from "@/components/shared/empty-state-card"
import { Map } from "lucide-react"

export function RoadmapContentNew() {
  return (
    <EmptyStateCard
      icon={Map}
      title="No roadmap created"
      description="Build your learning roadmap to track milestones across power systems, instrumentation, safety, and reliability training phases."
      actionLabel="Create Roadmap"
      onAction={() => {}}
    />
  )
}
