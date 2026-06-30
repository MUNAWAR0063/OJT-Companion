import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Calendar } from "lucide-react"

interface WeeklyGoalCardProps {
  goal: string
  dueDate: string
  priority: "high" | "medium" | "low"
  progress: number
  delay?: number
}

export function WeeklyGoalCard({ goal, dueDate, priority, progress, delay = 0 }: WeeklyGoalCardProps) {
  const priorityConfig = {
    high: { label: "High", color: "bg-red-500/10 text-red-600" },
    medium: { label: "Medium", color: "bg-orange-500/10 text-orange-600" },
    low: { label: "Low", color: "bg-blue-500/10 text-blue-600" },
  }

  const config = priorityConfig[priority]

  return (
    <Card
      className="p-4 transition-all duration-300 hover:shadow-lg cursor-pointer animate-slide-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <Badge variant="outline" className={`text-xs ${config.color}`}>
            {config.label}
          </Badge>
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2">{goal}</h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {dueDate}
          </div>
        </div>
        <div className="space-y-1 pt-1 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
            <span className="text-xs font-semibold text-foreground">{progress}%</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </Card>
  )
}
