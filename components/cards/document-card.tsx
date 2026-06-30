import { Card } from "@/components/ui/card"
import { FileText, Calendar, Download } from "lucide-react"

interface DocumentCardProps {
  title: string
  type: string
  date: string
  size: string
  delay?: number
}

export function DocumentCard({ title, type, date, size, delay = 0 }: DocumentCardProps) {
  return (
    <Card
      className="p-4 transition-all duration-300 hover:shadow-lg cursor-pointer animate-slide-in-up group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-xs font-medium text-muted-foreground uppercase">{type}</p>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {date}
          </div>
          <span className="text-xs font-medium text-muted-foreground">{size}</span>
        </div>
      </div>
    </Card>
  )
}
