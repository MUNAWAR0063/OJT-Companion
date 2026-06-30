import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel: string
  onAction: () => void
}

export function EmptyStateCard({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card className="p-12 md:p-16 text-center border border-dashed">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>}
      <Button onClick={onAction} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {actionLabel}
      </Button>
    </Card>
  )
}
