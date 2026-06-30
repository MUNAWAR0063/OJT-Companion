"use client"

import { Card } from "@/components/ui/card"
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from "recharts"

export function AnalyticsContentNew() {
  return (
    <div className="space-y-8">
      <Card className="p-8 border border-dashed text-center">
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No learning data yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your competency progress will display here as you complete tasks and document your learning.
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-6">Competency Progress (Empty Chart)</h3>
        <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Chart will appear when you add competency data</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-xs text-muted-foreground mb-1">Total Training Hours</p>
          <p className="text-3xl font-bold">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs text-muted-foreground mb-1">Competencies Mastered</p>
          <p className="text-3xl font-bold">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs text-muted-foreground mb-1">Overall Progress</p>
          <p className="text-3xl font-bold">0%</p>
        </Card>
      </div>
    </div>
  )
}
