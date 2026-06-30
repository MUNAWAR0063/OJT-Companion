import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, CheckCircle2 } from "lucide-react"

interface LearningProgressCardProps {
  title: string
  topic: string
  progress: number
  mastered?: boolean
  delay?: number
}

export function LearningProgressCard({
  title,
  topic,
  progress,
  mastered = false,
  delay = 0,
}: LearningProgressCardProps) {
  return (
    <Card
      className="p-4 transition-all duration-300 hover:shadow-lg cursor-pointer animate-slide-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{topic}</p>
            <h3 className="font-semibold text-sm text-foreground truncate">{title}</h3>
          </div>
          {mastered && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <BookOpen className="w-4 h-4 text-primary/60" />
            <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>
    </Card>
  )
}
