import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ComingSoonProps {
  icon: LucideIcon
  title: string
  description: string
}

export function ComingSoon({ icon: Icon, title, description }: ComingSoonProps) {
  return (
    <Card className="p-10 md:p-16 flex flex-col items-center text-center animate-slide-in">
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2 text-balance">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed text-pretty">{description}</p>
    </Card>
  )
}
