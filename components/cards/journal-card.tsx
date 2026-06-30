import { Card } from "@/components/ui/card"
import { NotebookPen, Calendar } from "lucide-react"

interface JournalCardProps {
  title: string
  date: string
  excerpt: string
  tags?: string[]
  delay?: number
}

export function JournalCard({ title, date, excerpt, tags = [], delay = 0 }: JournalCardProps) {
  return (
    <Card
      className="p-4 transition-all duration-300 hover:shadow-lg cursor-pointer animate-slide-in-up group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <NotebookPen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{excerpt}</p>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/50">
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-secondary text-foreground rounded">
                {tag}
              </span>
            ))}
            {tags.length > 2 && <span className="text-xs text-muted-foreground px-2 py-0.5">+{tags.length - 2}</span>}
          </div>
        )}
      </div>
    </Card>
  )
}
