"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { useRoadmapStore, getRoadmapProgress } from "@/lib/roadmap-store"

export function CurrentLearning() {
  const roadmaps = useRoadmapStore((state) => state.roadmaps)
  const selectedRoadmapId = useRoadmapStore((state) => state.selectedRoadmapId)
  const selectedRoadmap = roadmaps.find((roadmap) => roadmap.id === selectedRoadmapId) ?? roadmaps[0] ?? null
  const progressValue = getRoadmapProgress(selectedRoadmap)

  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "300ms" }}
    >
      <div className="space-y-6 text-center py-8">
        <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {selectedRoadmap ? `${progressValue}% roadmap complete` : "No roadmap created"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {selectedRoadmap
              ? `Continue ${selectedRoadmap.title} with ${selectedRoadmap.weeks.length} structured weeks.`
              : "Create a roadmap to track your 18-week OJT journey and update progress automatically."}
          </p>
        </div>
        <Link href="/learning/roadmap">
          <Button className="h-8 text-xs gap-2 mx-auto">
            <BookOpen className="w-3 h-3" />
            {selectedRoadmap ? "Open Roadmap" : "Create Roadmap"}
          </Button>
        </Link>
      </div>
    </Card>
  )
}
