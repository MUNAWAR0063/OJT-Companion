"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { getRoadmapProgress, useRoadmapStore } from "@/lib/roadmap-store"

export function LearningProgress() {
  const roadmaps = useRoadmapStore((state) => state.roadmaps)
  const selectedRoadmapId = useRoadmapStore((state) => state.selectedRoadmapId)
  const roadmap = roadmaps.find((item) => item.id === selectedRoadmapId) ?? roadmaps[0] ?? null
  const progress = getRoadmapProgress(roadmap)
  const completedWeeks = roadmap?.weeks.filter((week) => week.progress === 100).length ?? 0

  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "100ms" }}
    >
      <div className="space-y-6 text-center py-12">
        <TrendingUp className="w-14 h-14 text-muted-foreground/40 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {roadmap ? `${progress}% learning roadmap progress` : "No competency data yet"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {roadmap
              ? `${completedWeeks} of ${roadmap.weeks.length} weeks completed in ${roadmap.title}.`
              : "Create a learning roadmap to start tracking your OJT competency progress."}
          </p>
        </div>
        {roadmap && <Progress value={progress} className="mx-auto max-w-xl" />}
        <Link href="/learning/roadmap">
          <Button className="h-8 text-xs gap-2 mx-auto">
            <TrendingUp className="w-3 h-3" />
            {roadmap ? "View Roadmap" : "Get Started"}
          </Button>
        </Link>
      </div>
    </Card>
  )
}
