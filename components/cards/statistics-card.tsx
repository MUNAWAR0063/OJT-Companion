import { Card } from "@/components/ui/card"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatisticsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  subtitle?: string
  delay?: number
}

export function StatisticsCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  subtitle,
  delay = 0,
}: StatisticsCardProps) {
  const trendIcon =
    trend === "up" ? (
      <TrendingUp className="w-3 h-3 text-green-600" />
    ) : trend === "down" ? (
      <TrendingDown className="w-3 h-3 text-red-600" />
    ) : null

  return (
    <Card
      className="p-4 transition-all duration-300 hover:shadow-lg animate-slide-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          {trendIcon && <div>{trendIcon}</div>}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            {trendValue && <span className="text-xs font-semibold text-muted-foreground">{trendValue}</span>}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </Card>
  )
}
