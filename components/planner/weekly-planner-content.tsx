"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, PlusCircle } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/app-context"

export function WeeklyPlannerContent() {
  const { weeklyPlans } = useApp()

  if (weeklyPlans.length === 0) {
    return (
      <Card className="p-8 text-center md:p-12">
        <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">No weekly plan data yet</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Create the first weekly plan from the planner view to start tracking your foundation work.
        </p>
        <Button asChild>
          <Link href="/calendar">
            <PlusCircle className="mr-2 h-4 w-4" />
            Open Planner
          </Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {weeklyPlans.map((plan) => (
        <Card key={plan.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">Week {plan.weekNumber}</h3>
              <p className="text-sm text-muted-foreground">{plan.tripName}</p>
            </div>
            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {plan.objectives.length} objectives
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
