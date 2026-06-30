import { Card } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface QuickActionCardProps {
  label: string
  icon: LucideIcon
  onClick?: () => void
  delay?: number
}

export function QuickActionCard({ label, icon: Icon, onClick, delay = 0 }: QuickActionCardProps) {
  return (
    <Card
      className="p-4 transition-all duration-300 hover:shadow-lg cursor-pointer animate-slide-in-up hover:scale-[1.03] hover:border-primary/40"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xs font-medium text-center text-foreground">{label}</span>
      </div>
    </Card>
  )
}
