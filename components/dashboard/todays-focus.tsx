"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ListChecks } from "lucide-react"
import Link from "next/link"

export function TodaysFocus() {
  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "200ms" }}
    >
      <div className="space-y-6 text-center py-8">
        <ListChecks className="w-12 h-12 text-muted-foreground/50 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">No objectives today</h3>
          <p className="text-xs text-muted-foreground">Plan your daily objectives in the Weekly Planner to see them here</p>
        </div>
        <Link href="/calendar">
          <Button className="h-8 text-xs gap-2 mx-auto">
            <ListChecks className="w-3 h-3" />
            Go to Weekly Planner
          </Button>
        </Link>
      </div>
    </Card>
  )
}
