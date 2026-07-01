"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { getPlannerProgress, usePlannerStore } from "@/lib/planner-store"

export function WeeklyPlanner() {
  const weeks = usePlannerStore((state) => state.weeks)
  const progress = getPlannerProgress(weeks)
  const objectiveCount = weeks.reduce((total, week) => total + week.objectives.length, 0)

  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "400ms" }}
    >
      <div className="space-y-6 text-center py-8">
        <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {weeks.length ? `${progress}% planner completion` : "No weekly plan created"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {weeks.length
              ? `${objectiveCount} objectives across ${weeks.length} ${weeks.length === 1 ? "week" : "weeks"}.`
              : "Create your weekly learning objectives and track daily progress."}
          </p>
        </div>
        {weeks.length > 0 && <Progress value={progress} />}
        <Link href="/calendar">
          <Button className="h-8 text-xs gap-2 mx-auto">
            <Calendar className="w-3 h-3" />
            {weeks.length ? "Open Planner" : "Plan This Week"}
          </Button>
        </Link>
      </div>
    </Card>
  )
}
