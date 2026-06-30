import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Zap } from "lucide-react"

interface KnowledgeCardProps {
  topic: string
  category: string
  description: string
  importance: "core" | "medium" | "optional"
  mastered?: boolean
  delay?: number
}

export function KnowledgeCard({
  topic,
  category,
  description,
  importance,
  mastered = false,
  delay = 0,
}: KnowledgeCardProps) {
  const importanceConfig = {
    core: { label: "Core", color: "bg-red-500/10 text-red-600" },
    medium: { label: "Medium", color: "bg-orange-500/10 text-orange-600" },
    optional: { label: "Optional", color: "bg-blue-500/10 text-blue-600" },
  }

  const config = importanceConfig[importance]

  return (
    <Card
      className={`p-5 md:p-6 transition-all duration-300 hover:shadow-lg cursor-pointer animate-slide-in-up ${
        mastered ? "opacity-60" : ""
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <Badge variant="outline" className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </Badge>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{category}</p>
          <h3 className={`font-semibold text-sm leading-snug text-foreground ${mastered ? "line-through" : ""}`}>{topic}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>
        </div>
        {mastered && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-border/50 text-xs text-success-foreground font-medium">
            <Zap className="w-4 h-4" />
            Proficient
          </div>
        )}
      </div>
    </Card>
  )
}
