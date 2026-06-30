import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cpu, AlertCircle } from "lucide-react"

interface EquipmentCardProps {
  name: string
  category: string
  status: "operational" | "maintenance" | "inactive"
  hours?: number
  delay?: number
}

export function EquipmentCard({ name, category, status, hours, delay = 0 }: EquipmentCardProps) {
  const statusConfig = {
    operational: { label: "Operational", color: "bg-green-500/10 text-green-600" },
    maintenance: { label: "Maintenance", color: "bg-yellow-500/10 text-yellow-600" },
    inactive: { label: "Inactive", color: "bg-gray-500/10 text-gray-600" },
  }

  const config = statusConfig[status]

  return (
    <Card
      className="p-4 transition-all duration-300 hover:shadow-lg cursor-pointer animate-slide-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <Badge variant="outline" className={`text-xs ${config.color}`}>
            {config.label}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{category}</p>
          <h3 className="font-semibold text-sm text-foreground truncate">{name}</h3>
        </div>
        {hours && (
          <div className="flex items-center gap-2 pt-1 border-t border-border/50">
            <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{hours} hours operational</span>
          </div>
        )}
      </div>
    </Card>
  )
}
